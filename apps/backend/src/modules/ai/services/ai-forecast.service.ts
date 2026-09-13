import { Injectable, Logger } from '@nestjs/common';
import { DatabaseService } from '../../../database/database.service';
import { NineRouterService } from './nine-router.service';

export interface EvmMetrics {
  totalRab: number;
  plannedProgressPct: number;
  actualProgressPct: number;
  pv: number;
  ev: number;
  ac: number;
  cpi: number;
  spi: number;
  eac: number;
  costVariance: number;
  scheduleVariance: number;
}

export interface ProjectForecastReport {
  projectId: string;
  projectName: string;
  metrics: EvmMetrics;
  narrativeForecast: string;
  isAiGenerated: boolean;
  insightId?: string;
}

@Injectable()
export class AiForecastService {
  private readonly logger = new Logger(AiForecastService.name);

  constructor(
    private readonly db: DatabaseService,
    private readonly nineRouter: NineRouterService,
  ) {}

  async generateForecast(projectId: string): Promise<ProjectForecastReport> {
    // 1. Ambil data proyek dan nilai total RAB yang disetujui
    const projectRes = await this.db.query(
      `SELECT p.id, p.name, p.organization_id, COALESCE(r.total_amount, 0) as total_rab
       FROM projects p
       LEFT JOIN rab r ON r.project_id = p.id AND r.status = 'approved'
       WHERE p.id = $1`,
      [projectId],
    );

    if (projectRes.rows.length === 0) {
      throw new Error(`Proyek dengan ID ${projectId} tidak ditemukan`);
    }

    const project = projectRes.rows[0];
    const totalRab = Number(project.total_rab);

    // 2. Ambil progres Kurva S terkini
    const progressRes = await this.db.query(
      `SELECT planned_progress_pct, actual_progress_pct
       FROM project_progress_logs
       WHERE project_id = $1
       ORDER BY period_week DESC
       LIMIT 1`,
      [projectId],
    );

    const plannedProgressPct = progressRes.rows[0] ? Number(progressRes.rows[0].planned_progress_pct) : 50;
    const actualProgressPct = progressRes.rows[0] ? Number(progressRes.rows[0].actual_progress_pct) : 48;

    // 3. Ambil total realisasi pengeluaran aktual (AC)
    const actualRes = await this.db.query(
      `SELECT COALESCE(SUM(ae.total_actual_amount), 0) as total_actual
       FROM rab r
       JOIN rab_items ri ON ri.rab_id = r.id
       JOIN actual_entries ae ON ae.rab_item_id = ri.id
       WHERE r.project_id = $1 AND r.status = 'approved'`,
      [projectId],
    );

    const ac = Number(actualRes.rows[0]?.total_actual || 0);

    // 4. Hitung rumus EVM deterministik di backend (bukan oleh AI)
    const pv = (plannedProgressPct / 100) * totalRab;
    const ev = (actualProgressPct / 100) * totalRab;
    const cpi = ac > 0 ? Number((ev / ac).toFixed(3)) : 1.0;
    const spi = pv > 0 ? Number((ev / pv).toFixed(3)) : 1.0;
    const eac = cpi > 0 ? Number((totalRab / cpi).toFixed(2)) : totalRab;
    const costVariance = ev - ac;
    const scheduleVariance = ev - pv;

    const metrics: EvmMetrics = {
      totalRab,
      plannedProgressPct,
      actualProgressPct,
      pv: Math.round(pv),
      ev: Math.round(ev),
      ac: Math.round(ac),
      cpi,
      spi,
      eac: Math.round(eac),
      costVariance: Math.round(costVariance),
      scheduleVariance: Math.round(scheduleVariance),
    };

    // 5. Minta narasi dari Claude via 9Router (Claude tidak menghitung ulang angka)
    let narrativeForecast = '';
    let isAiGenerated = false;
    let tokensUsed = 0;
    let modelUsed = 'rule-based-fallback';
    let latencyMs = 0;

    try {
      const promptContext = `
Proyek: ${project.name}
- Total Anggaran (RAB): Rp ${totalRab.toLocaleString('id-ID')}
- Progres Fisik: Rencana ${plannedProgressPct}%, Aktual ${actualProgressPct}%
- Planned Value (PV): Rp ${metrics.pv.toLocaleString('id-ID')}
- Earned Value (EV): Rp ${metrics.ev.toLocaleString('id-ID')}
- Actual Cost (AC): Rp ${metrics.ac.toLocaleString('id-ID')}
- Cost Performance Index (CPI): ${cpi} (${cpi < 1 ? 'Cost Overrun / Boros' : 'Cost Efficient'})
- Schedule Performance Index (SPI): ${spi} (${spi < 1 ? 'Behind Schedule / Terlambat' : 'On Schedule'})
- Estimate at Completion (EAC): Rp ${metrics.eac.toLocaleString('id-ID')}
- Estimasi Deviasi Biaya Akhir: Rp ${(metrics.eac - totalRab).toLocaleString('id-ID')}
      `.trim();

      const chat = await this.nineRouter.createChatCompletion([
        {
          role: 'system',
          content:
            'Kamu adalah penasihat manajemen proyek konstruksi PLTS. Berdasarkan metrik EVM yang diberikan oleh sistem di bawah ini, susun ringkasan analisis performa dan proyeksi akhir (forecast) dalam 2-3 paragraf ringkas berbahasa Indonesia. Jangan menghitung ulang angka, cukup gunakan dan jelaskan arti angka-angka tersebut.',
        },
        {
          role: 'user',
          content: promptContext,
        },
      ]);

      narrativeForecast = chat.content;
      isAiGenerated = true;
      tokensUsed = chat.tokensUsed || 0;
      modelUsed = chat.model;
      latencyMs = chat.latencyMs;
    } catch (err: any) {
      this.logger.warn(`9Router EVM forecast narrative failed, menggunakan fallback aturan: ${err.message}`);
      const costStatus = cpi >= 1 ? 'efisien' : 'boros (overbudget)';
      const schedStatus = spi >= 1 ? 'sesuai jadwal' : 'mengalami keterlambatan';
      narrativeForecast = `Proyek ${project.name} saat ini memiliki CPI ${cpi} (${costStatus}) dan SPI ${spi} (${schedStatus}). Proyeksi biaya akhir (EAC) diestimasikan sebesar Rp ${metrics.eac.toLocaleString('id-ID')} terhadap nilai kontrak Rp ${totalRab.toLocaleString('id-ID')}.`;
    }

    // 6. Simpan ke ai_insights
    let insightId: string | undefined;
    try {
      const insightRes = await this.db.query(
        `
        INSERT INTO ai_insights (
          project_id, 
          type, 
          input_context, 
          output, 
          tokens_used, 
          model_used, 
          latency_ms,
          organization_id
        ) VALUES ($1, 'forecast', $2, $3, $4, $5, $6, $7)
        RETURNING id;
        `,
        [
          projectId,
          JSON.stringify(metrics),
          JSON.stringify({ narrativeForecast, isAiGenerated }),
          tokensUsed,
          modelUsed,
          latencyMs,
          project.organization_id || null,
        ],
      );
      insightId = insightRes.rows[0]?.id;
    } catch (saveErr: any) {
      this.logger.warn(`Gagal mencatat audit ai_insights untuk forecast: ${saveErr.message}`);
    }

    return {
      projectId,
      projectName: project.name,
      metrics,
      narrativeForecast,
      isAiGenerated,
      insightId,
    };
  }
}
