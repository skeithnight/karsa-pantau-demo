import { Injectable } from '@nestjs/common';
import { DatabaseService } from '../../database/database.service';

@Injectable()
export class ManpowerService {
  constructor(private readonly db: DatabaseService) {}

  async findByProject(projectId: string) {
    const res = await this.db.query(
      `SELECT ml.*, u.name as entered_by_name, ri.description as rab_item_desc
       FROM manpower_logs ml
       LEFT JOIN users u ON u.id = ml.entered_by
       LEFT JOIN rab_items ri ON ri.id = ml.rab_item_id
       WHERE ml.project_id = $1
       ORDER BY ml.log_date DESC, ml.created_at DESC`,
      [projectId],
    );
    return res.rows.map((row) => ({
      ...row,
      output_unit_installed: row.output_unit_installed ? parseFloat(row.output_unit_installed) : null,
      gap: row.actual_headcount - row.planned_headcount,
    }));
  }

  async create(
    projectId: string,
    data: {
      teamName: string;
      rabItemId?: string | null;
      plannedHeadcount: number;
      actualHeadcount: number;
      outputUnitInstalled?: number;
      logDate: string;
    },
    userId: string,
  ) {
    const res = await this.db.query(
      `INSERT INTO manpower_logs (
         project_id, team_name, rab_item_id, planned_headcount, actual_headcount,
         output_unit_installed, log_date, entered_by
       ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
       RETURNING *`,
      [
        projectId,
        data.teamName,
        data.rabItemId || null,
        data.plannedHeadcount,
        data.actualHeadcount,
        data.outputUnitInstalled || null,
        data.logDate,
        userId,
      ],
    );
    return res.rows[0];
  }
}
