import { Injectable, Logger } from '@nestjs/common';
import { DatabaseService } from '../../../database/database.service';
import { NineRouterService } from './nine-router.service';

export interface AnomalyItem {
  rabItemId: string;
  wbsCode: string;
  description: string;
  budgetAmount: number;
  actualAmount: number;
  varianceAmount: number;
  variancePct: number;
  severity: 'CRITICAL' | 'WARNING';
}

export interface ProjectAnomalyReport {
  projectId: string;
  projectName: string;
  totalAnomalies: number;
  narrativeSummary: string;
  isAiGenerated: boolean;
  anomalies: AnomalyItem[];
  insightId?: string;
}

@Injectable()
export class AiAnomalyService {
  private readonly logger = new Logger(AiAnomalyService.name);

  constructor(
    private readonly db: DatabaseService,
    private readonly nineRouter: NineRouterService,
  ) {}

  async detectProjectAnomalies(projectId: string, thresholdPct = 10): Promise<ProjectAnomalyReport> {
    // 1. Ambil info proyek
    const projectRes = await this.db.query(
      `SELECT id, name, organization_id FROM projects WHERE id = $1`,
      [projectId],
    );

    if (projectRes.rows.length === 0) {
      throw new Error(`Proyek dengan ID ${projectId} tidak ditemukan`);
    }

    const project = projectRes.rows[0];

    // 2. Hitung variance deterministik di backend untuk item RAB yang aktif
    const itemsSql = `
      SELECT 
        ri.id as "rabItemId",
        ri.wbs_code as "wbsCode",
        ri.description,
        ri.subtotal as "budgetAmount",
        COALESCE(SUM(ae.total_actual_amount), 0) as "actualAmount"
      FROM rab r
      JOIN rab_items ri ON ri.rab_id = r.id
      LEFT JOIN actual_entries ae ON ae.rab_item_id = ri.id
      WHERE r.project_id = $1 AND r.status = 'approved'
      GROUP BY ri.id, ri.wbs_code, ri.description, ri.subtotal
      HAVING COALESCE(SUM(ae.total_actual_amount), 0) > 0;
    `;

    const itemsRes = await this.db.query(itemsSql, [projectId]);
    const thresholdFraction = thresholdPct / 100;

    const anomalies: AnomalyItem[] = [];

    for (const row of itemsRes.rows) {
      const budget = Number(row.budgetAmount);
      const actual = Number(row.actualAmount);
      if (budget <= 0) continue;

      const varianceAmount = actual - budget;
      const variancePct = (varianceAmount / budget) * 100;

      // Ambil yang melampaui ambang batas
      if (Math.abs(varianceAmount / budget) >= thresholdFraction) {
        anomalies.push({
          rabItemId: row.rabItemId,
          wbsCode: row.wbsCode,
          description: row.description,
          budgetAmount: budget,
          actualAmount: actual,
          varianceAmount,
          variancePct: Number(variancePct.toFixed(1)),
          severity: variancePct > 20 ? 'CRITICAL' : 'WARNING',
        });
      }
    }

    if (anomalies.length === 0) {
      return {
        projectId,
        projectName: project.name,
        totalAnomalies: 0,
        narrativeSummary: 'Seluruh pengeluaran aktual masih berada dalam ambang batas toleransi anggaran (±10%).',
        isAiGenerated: false,
        anomalies: [],
      };
    }

    // 3. Kirim ke Claude via 9Router untuk dirangkum dalam narasi cost-control
    let narrativeSummary = '';
    let isAiGenerated = false;
    let tokensUsed = 0;
    let modelUsed = 'rule-based-fallback';
    let latencyMs = 0;

    try {
      const anomalyPromptList = anomalies
        .map(
          (a) =>
            `- [${a.wbsCode}] ${a.description}: RAB Rp ${(a.budgetAmount / 1e6).toFixed(1)}M, Realisasi Rp ${(a.actualAmount / 1e6).toFixed(1)}M (${a.variancePct > 0 ? '+' : ''}${a.variancePct}%)`,
        )
        .join('\n');

      const chat = await this.nineRouter.createChatCompletion([
        {
          role: 'system',
          content:
            'Kamu adalah asisten cost control proyek konstruksi PLTS. Ringkas temuan anomali biaya dalam 2-3 kalimat per item, bahasa Indonesia profesional, langsung ke inti penyebab dan rekomendasi mitigasi.',
        },
        {
          role: 'user',
          content: `Data variance proyek "${project.name}":\n${anomalyPromptList}`,
        },
      ]);

      narrativeSummary = chat.content;
      isAiGenerated = true;
      tokensUsed = chat.tokensUsed || 0;
      modelUsed = chat.model;
      latencyMs = chat.latencyMs;
    } catch (err: any) {
      this.logger.warn(`9Router anomaly narrative failed, menggunakan fallback aturan: ${err.message}`);
      narrativeSummary = anomalies
        .map(
          (a) =>
            `Perhatian pada [${a.wbsCode}] ${a.description}: telah melampaui RAB sebesar ${a.variancePct}% (selisih Rp ${Math.abs(a.varianceAmount).toLocaleString('id-ID')}).`,
        )
        .join(' ');
    }

    // 4. Catat ke tabel ai_insights untuk audit trail
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
        ) VALUES ($1, 'anomaly', $2, $3, $4, $5, $6, $7)
        RETURNING id;
        `,
        [
          projectId,
          JSON.stringify({ anomaliesCount: anomalies.length, items: anomalies }),
          JSON.stringify({ narrativeSummary, isAiGenerated }),
          tokensUsed,
          modelUsed,
          latencyMs,
          project.organization_id || null,
        ],
      );
      insightId = insightRes.rows[0]?.id;
    } catch (saveErr: any) {
      this.logger.warn(`Gagal mencatat audit ai_insights: ${saveErr.message}`);
    }

    return {
      projectId,
      projectName: project.name,
      totalAnomalies: anomalies.length,
      narrativeSummary,
      isAiGenerated,
      anomalies,
      insightId,
    };
  }
}
