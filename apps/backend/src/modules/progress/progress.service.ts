import { Injectable, NotFoundException } from '@nestjs/common';
import { DatabaseService } from '../../database/database.service';
import { EvmCalculatorService } from './evm-calculator.service';

@Injectable()
export class ProgressService {
  constructor(
    private readonly db: DatabaseService,
    private readonly evmCalculator: EvmCalculatorService,
  ) {}

  async findByProject(projectId: string) {
    const logsRes = await this.db.query(
      `SELECT ppl.*, u.name as reported_by_name
       FROM project_progress_logs ppl
       LEFT JOIN users u ON u.id = ppl.reported_by
       WHERE ppl.project_id = $1
       ORDER BY ppl.period_week ASC`,
      [projectId],
    );

    const rabRes = await this.db.query(
      `SELECT total_amount FROM rab WHERE project_id = $1 AND status = 'approved' ORDER BY version DESC LIMIT 1`,
      [projectId],
    );
    const totalRab = rabRes.rows[0] ? parseFloat(rabRes.rows[0].total_amount) : 0;

    return {
      totalRab,
      logs: logsRes.rows.map((row) => ({
        ...row,
        planned_progress_pct: parseFloat(row.planned_progress_pct),
        actual_progress_pct: parseFloat(row.actual_progress_pct),
        earned_value: parseFloat(row.earned_value),
        actual_cost: parseFloat(row.actual_cost),
        cpi: parseFloat(row.cpi),
        spi: parseFloat(row.spi),
        eac: parseFloat(row.eac),
      })),
    };
  }

  async logProgress(
    projectId: string,
    data: {
      periodWeek: number;
      logDate: string;
      plannedProgressPct: number;
      actualProgressPct: number;
      notes?: string;
    },
    userId: string,
  ) {
    // 1. Ambil total RAB baseline yang approved
    const rabRes = await this.db.query(
      `SELECT total_amount FROM rab WHERE project_id = $1 AND status = 'approved' ORDER BY version DESC LIMIT 1`,
      [projectId],
    );
    if (!rabRes.rows[0]) {
      throw new NotFoundException('Proyek ini belum memiliki RAB baseline yang approved');
    }
    const totalRab = parseFloat(rabRes.rows[0].total_amount);

    // 2. Ambil akumulasi pengeluaran actual sampai saat ini
    const actualRes = await this.db.query(
      `SELECT COALESCE(SUM(ae.total_actual_amount), 0) as total_actual
       FROM actual_entries ae
       JOIN rab_items ri ON ri.id = ae.rab_item_id
       JOIN rab r ON r.id = ri.rab_id
       WHERE r.project_id = $1`,
      [projectId],
    );
    const actualCost = parseFloat(actualRes.rows[0].total_actual);

    // 3. Hitung metrik EVM deterministik
    const evm = this.evmCalculator.calculateEvm(
      totalRab,
      data.plannedProgressPct,
      data.actualProgressPct,
      actualCost,
    );

    // 4. Simpan log progres
    const insertRes = await this.db.query(
      `INSERT INTO project_progress_logs (
         project_id, period_week, log_date, planned_progress_pct, actual_progress_pct,
         earned_value, actual_cost, cpi, spi, eac, notes, reported_by
       ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12)
       RETURNING *`,
      [
        projectId,
        data.periodWeek,
        data.logDate,
        data.plannedProgressPct,
        data.actualProgressPct,
        evm.earnedValue,
        evm.actualCost,
        evm.cpi,
        evm.spi,
        evm.estimateAtCompletion,
        data.notes || null,
        userId,
      ],
    );

    return {
      ...insertRes.rows[0],
      evmMetrics: evm,
    };
  }
}
