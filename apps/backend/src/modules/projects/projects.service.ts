import { Injectable, NotFoundException } from '@nestjs/common';
import { DatabaseService } from '../../database/database.service';
import { SubscriptionsService } from '../subscriptions/subscriptions.service';
import { ProjectStatus } from '@karsa/shared-types';

@Injectable()
export class ProjectsService {
  constructor(
    private readonly db: DatabaseService,
    private readonly subscriptionsService: SubscriptionsService,
  ) {}

  async findAll(page = 1, limit = 20, status?: string, organizationId?: string) {
    const offset = (page - 1) * limit;
    let query = `
      SELECT p.*,
        COALESCE(r.total_amount, 0) as total_rab,
        COALESCE(SUM(ae.total_actual_amount), 0) as total_actual,
        COALESCE(pr.actual_progress_pct, 0) as physical_progress_pct
      FROM projects p
      LEFT JOIN rab r ON r.project_id = p.id AND r.status = 'approved'
      LEFT JOIN rab_items ri ON ri.rab_id = r.id
      LEFT JOIN actual_entries ae ON ae.rab_item_id = ri.id
      LEFT JOIN (
        SELECT DISTINCT ON (project_id) project_id, actual_progress_pct
        FROM project_progress_logs
        ORDER BY project_id, period_week DESC
      ) pr ON pr.project_id = p.id
    `;
    const params: any[] = [];
    const whereClauses: string[] = [];

    if (organizationId) {
      params.push(organizationId);
      whereClauses.push(`p.organization_id = $${params.length}`);
    }

    if (status) {
      params.push(status);
      whereClauses.push(`p.status = $${params.length}`);
    }

    if (whereClauses.length > 0) {
      query += ` WHERE ${whereClauses.join(' AND ')}`;
    }

    query += ` GROUP BY p.id, r.total_amount, pr.actual_progress_pct ORDER BY p.created_at DESC LIMIT $${params.length + 1} OFFSET $${params.length + 2}`;
    params.push(limit, offset);

    const res = await this.db.query(query, params);

    let countQuery = 'SELECT COUNT(*) FROM projects';
    const countParams: any[] = [];
    if (organizationId) {
      countParams.push(organizationId);
      countQuery += ` WHERE organization_id = $1`;
    }
    const countRes = await this.db.query(countQuery, countParams);

    return {
      data: res.rows.map((row) => ({
        id: row.id,
        name: row.name,
        location: row.location,
        capacityMw: parseFloat(row.capacity_mw),
        targetCodDate: row.target_cod_date,
        status: row.status,
        organizationId: row.organization_id,
        totalRab: parseFloat(row.total_rab || 0),
        totalActual: parseFloat(row.total_actual || 0),
        variancePct:
          row.total_rab > 0
            ? Math.round((((row.total_actual - row.total_rab) / row.total_rab) * 100 + Number.EPSILON) * 100) / 100
            : 0,
        physicalProgressPct: parseFloat(row.physical_progress_pct || 0),
        createdAt: row.created_at,
      })),
      total: parseInt(countRes.rows[0].count, 10),
      page,
      limit,
    };
  }

  async findOne(id: string, organizationId?: string) {
    let query = `
      SELECT p.*,
        COALESCE(r.total_amount, 0) as total_rab,
        COALESCE(SUM(ae.total_actual_amount), 0) as total_actual,
        COALESCE(pr.actual_progress_pct, 0) as physical_progress_pct
       FROM projects p
       LEFT JOIN rab r ON r.project_id = p.id AND r.status = 'approved'
       LEFT JOIN rab_items ri ON ri.rab_id = r.id
       LEFT JOIN actual_entries ae ON ae.rab_item_id = ri.id
       LEFT JOIN (
         SELECT DISTINCT ON (project_id) project_id, actual_progress_pct
         FROM project_progress_logs
         ORDER BY project_id, period_week DESC
       ) pr ON pr.project_id = p.id
       WHERE p.id = $1
    `;
    const params: any[] = [id];

    if (organizationId) {
      params.push(organizationId);
      query += ` AND p.organization_id = $2`;
    }

    query += ` GROUP BY p.id, r.total_amount, pr.actual_progress_pct`;

    const res = await this.db.query(query, params);

    const project = res.rows[0];
    if (!project) {
      throw new NotFoundException(`Proyek dengan ID '${id}' tidak ditemukan`);
    }

    return {
      id: project.id,
      name: project.name,
      location: project.location,
      capacityMw: parseFloat(project.capacity_mw),
      targetCodDate: project.target_cod_date,
      status: project.status,
      organizationId: project.organization_id,
      totalRab: parseFloat(project.total_rab || 0),
      totalActual: parseFloat(project.total_actual || 0),
      variancePct:
        project.total_rab > 0
          ? Math.round(
              (((project.total_actual - project.total_rab) / project.total_rab) * 100 + Number.EPSILON) * 100,
            ) / 100
          : 0,
      physicalProgressPct: parseFloat(project.physical_progress_pct || 0),
      createdAt: project.created_at,
    };
  }

  async create(
    data: { name: string; location: string; capacityMw: number; targetCodDate?: string },
    userId: string,
    organizationId?: string,
  ) {
    let effectiveOrgId = organizationId;

    // Jika organizationId tidak diberikan, cari organisasi default milik user
    if (!effectiveOrgId) {
      const orgRes = await this.db.query<any>(
        `SELECT organization_id FROM organization_members WHERE user_id = $1 AND is_active = true ORDER BY created_at ASC LIMIT 1`,
        [userId],
      );
      effectiveOrgId = orgRes.rows[0]?.organization_id;
    }

    // Jika organisasi ditemukan, periksa kuota langganan sebelum create
    if (effectiveOrgId) {
      await this.subscriptionsService.checkProjectQuota(effectiveOrgId);
    }

    const res = await this.db.query(
      `INSERT INTO projects (name, location, capacity_mw, target_cod_date, status, created_by, organization_id)
       VALUES ($1, $2, $3, $4, $5, $6, $7)
       RETURNING *`,
      [data.name, data.location, data.capacityMw, data.targetCodDate || null, ProjectStatus.PLANNING, userId, effectiveOrgId || null],
    );
    return res.rows[0];
  }

  async update(id: string, data: Partial<{ name: string; location: string; capacityMw: number; status: ProjectStatus }>) {
    const fields: string[] = [];
    const values: any[] = [];
    let idx = 1;

    if (data.name) {
      fields.push(`name = $${idx++}`);
      values.push(data.name);
    }
    if (data.location) {
      fields.push(`location = $${idx++}`);
      values.push(data.location);
    }
    if (data.capacityMw !== undefined) {
      fields.push(`capacity_mw = $${idx++}`);
      values.push(data.capacityMw);
    }
    if (data.status) {
      fields.push(`status = $${idx++}`);
      values.push(data.status);
    }

    fields.push(`updated_at = now()`);
    values.push(id);

    const query = `UPDATE projects SET ${fields.join(', ')} WHERE id = $${idx} RETURNING *`;
    const res = await this.db.query(query, values);
    if (!res.rows[0]) {
      throw new NotFoundException(`Proyek dengan ID '${id}' tidak ditemukan`);
    }
    return res.rows[0];
  }
}
