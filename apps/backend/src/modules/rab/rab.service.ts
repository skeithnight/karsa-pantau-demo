import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { DatabaseService } from '../../database/database.service';
import { RabCalculatorService } from './rab-calculator.service';
import { RabStatus, BaselineType, WorkPackage, CostCategory } from '@karsa/shared-types';

@Injectable()
export class RabService {
  constructor(
    private readonly db: DatabaseService,
    private readonly calculator: RabCalculatorService,
  ) {}

  async findByProject(projectId: string) {
    const res = await this.db.query(
      `SELECT r.*, u.name as approved_by_name
       FROM rab r
       LEFT JOIN users u ON u.id = r.approved_by
       WHERE r.project_id = $1
       ORDER BY r.version DESC`,
      [projectId],
    );
    return res.rows;
  }

  async findActiveByProject(projectId: string) {
    const rabRes = await this.db.query(
      `SELECT r.*, u.name as approved_by_name
       FROM rab r
       LEFT JOIN users u ON u.id = r.approved_by
       WHERE r.project_id = $1 AND r.status = 'approved'
       ORDER BY r.version DESC LIMIT 1`,
      [projectId],
    );
    const rab = rabRes.rows[0];
    if (!rab) {
      return null;
    }

    const itemsRes = await this.db.query(
      `SELECT ri.*,
        COALESCE(SUM(ae.total_actual_amount), 0) as total_actual
       FROM rab_items ri
       LEFT JOIN actual_entries ae ON ae.rab_item_id = ri.id
       WHERE ri.rab_id = $1
       GROUP BY ri.id
       ORDER BY ri.wbs_code ASC`,
      [rab.id],
    );

    return {
      ...rab,
      total_amount: parseFloat(rab.total_amount),
      items: itemsRes.rows.map((row) => ({
        ...row,
        volume: parseFloat(row.volume),
        unit_price: parseFloat(row.unit_price),
        subtotal: parseFloat(row.subtotal),
        weight_pct: parseFloat(row.weight_pct),
        total_actual: parseFloat(row.total_actual || 0),
        variance_pct:
          row.subtotal > 0
            ? Math.round((((row.total_actual - row.subtotal) / row.subtotal) * 100 + Number.EPSILON) * 100) / 100
            : 0,
      })),
    };
  }

  async findPendingApprovals(organizationId?: string) {
    let query = `
      SELECT r.*, p.name as project_name, p.capacity_mw
      FROM rab r
      JOIN projects p ON p.id = r.project_id
      WHERE r.status = 'submitted'
    `;
    const params: any[] = [];
    if (organizationId) {
      params.push(organizationId);
      query += ` AND p.organization_id = $1`;
    }
    query += ` ORDER BY r.submitted_at ASC`;
    const res = await this.db.query(query, params);
    return res.rows.map((row) => ({
      ...row,
      total_amount: parseFloat(row.total_amount),
      capacity_mw: parseFloat(row.capacity_mw),
    }));
  }

  async create(projectId: string, baselineType = BaselineType.ORIGINAL_CONTRACT, notes?: string) {
    // Cari versi terakhir
    const lastRes = await this.db.query(
      `SELECT MAX(version) as max_version FROM rab WHERE project_id = $1`,
      [projectId],
    );
    const nextVersion = (lastRes.rows[0]?.max_version || 0) + 1;

    const res = await this.db.query(
      `INSERT INTO rab (project_id, version, baseline_type, status, notes)
       VALUES ($1, $2, $3, $4, $5)
       RETURNING *`,
      [projectId, nextVersion, baselineType, RabStatus.DRAFT, notes || null],
    );
    return res.rows[0];
  }

  async addItem(
    rabId: string,
    data: {
      parentId?: string | null;
      wbsCode: string;
      itemCode: string;
      workPackage: WorkPackage;
      category: CostCategory;
      description: string;
      volume: number;
      unit: string;
      unitPrice: number;
    },
  ) {
    const rabRes = await this.db.query('SELECT status FROM rab WHERE id = $1', [rabId]);
    if (!rabRes.rows[0]) {
      throw new NotFoundException(`RAB dengan ID '${rabId}' tidak ditemukan`);
    }
    if (rabRes.rows[0].status !== RabStatus.DRAFT) {
      throw new BadRequestException('Hanya RAB berstatus draft yang dapat ditambah item');
    }

    // Validasi kalkulasi subtotal
    this.calculator.calculateSubtotal(data.volume, data.unitPrice);

    const res = await this.db.query(
      `INSERT INTO rab_items (
         rab_id, parent_id, wbs_code, item_code, work_package, category,
         description, volume, unit, unit_price
       ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)
       RETURNING *`,
      [
        rabId,
        data.parentId || null,
        data.wbsCode,
        data.itemCode,
        data.workPackage,
        data.category,
        data.description,
        data.volume,
        data.unit,
        data.unitPrice,
      ],
    );

    await this.recalculateRabTotals(rabId);
    return res.rows[0];
  }

  async deleteItem(rabId: string, itemId: string) {
    const rabRes = await this.db.query('SELECT status FROM rab WHERE id = $1', [rabId]);
    if (!rabRes.rows[0] || rabRes.rows[0].status !== RabStatus.DRAFT) {
      throw new BadRequestException('Hanya RAB berstatus draft yang dapat dihapus itemnya');
    }

    await this.db.query('DELETE FROM rab_items WHERE id = $1 AND rab_id = $2', [itemId, rabId]);
    await this.recalculateRabTotals(rabId);
    return { success: true };
  }

  async submit(rabId: string) {
    const rabRes = await this.db.query('SELECT * FROM rab WHERE id = $1', [rabId]);
    const rab = rabRes.rows[0];
    if (!rab) throw new NotFoundException('RAB tidak ditemukan');
    if (rab.status !== RabStatus.DRAFT) {
      throw new BadRequestException('Hanya RAB berstatus draft yang dapat diajukan (submit)');
    }

    await this.recalculateRabTotals(rabId);

    const res = await this.db.query(
      `UPDATE rab SET status = $1, submitted_at = now(), updated_at = now() WHERE id = $2 RETURNING *`,
      [RabStatus.SUBMITTED, rabId],
    );
    return res.rows[0];
  }

  async approve(rabId: string, approverId: string) {
    const rabRes = await this.db.query('SELECT * FROM rab WHERE id = $1', [rabId]);
    const rab = rabRes.rows[0];
    if (!rab) throw new NotFoundException('RAB tidak ditemukan');
    if (rab.status !== RabStatus.SUBMITTED) {
      throw new BadRequestException('Hanya RAB berstatus submitted yang dapat di-approve');
    }

    return this.db.withTransaction(async (client) => {
      const res = await client.query(
        `UPDATE rab
         SET status = $1, approved_by = $2, approved_at = now(), updated_at = now()
         WHERE id = $3 RETURNING *`,
        [RabStatus.APPROVED, approverId, rabId],
      );

      // Salin item pekerjaan ke rab_item_history untuk knowledge base pencarian harga masa depan
      await client.query(
        `INSERT INTO rab_item_history (source_project_id, item_code, work_package, category, description, unit, unit_price)
         SELECT r.project_id, ri.item_code, ri.work_package, ri.category, ri.description, ri.unit, ri.unit_price
         FROM rab_items ri
         JOIN rab r ON r.id = ri.rab_id
         WHERE ri.rab_id = $1`,
        [rabId],
      );

      return res.rows[0];
    });
  }

  async reject(rabId: string, note: string) {
    if (!note || note.trim().length === 0) {
      throw new BadRequestException('Catatan penolakan (note) wajib disertakan');
    }

    const rabRes = await this.db.query('SELECT * FROM rab WHERE id = $1', [rabId]);
    const rab = rabRes.rows[0];
    if (!rab) throw new NotFoundException('RAB tidak ditemukan');
    if (rab.status !== RabStatus.SUBMITTED) {
      throw new BadRequestException('Hanya RAB berstatus submitted yang dapat di-reject');
    }

    const res = await this.db.query(
      `UPDATE rab
       SET status = $1, rejection_note = $2, updated_at = now()
       WHERE id = $3 RETURNING *`,
      [RabStatus.REJECTED, note.trim(), rabId],
    );
    return res.rows[0];
  }

  private async recalculateRabTotals(rabId: string) {
    const itemsRes = await this.db.query(
      'SELECT id, volume, unit_price, subtotal FROM rab_items WHERE rab_id = $1',
      [rabId],
    );
    const items = itemsRes.rows.map((row) => ({
      id: row.id,
      volume: parseFloat(row.volume),
      unitPrice: parseFloat(row.unit_price),
      subtotal: parseFloat(row.subtotal),
    }));

    const totalRab = this.calculator.calculateTotalRab(items);
    const weights = this.calculator.calculateWeights(items, totalRab);

    // Batch update bobot masing-masing item menggunakan UNNEST (O(1) round-trip bukan O(N))
    if (items.length > 0) {
      const ids = items.map((it) => it.id);
      await this.db.query(
        `UPDATE rab_items AS ri
         SET weight_pct = v.weight
         FROM (SELECT unnest($1::uuid[]) AS id, unnest($2::numeric[]) AS weight) AS v
         WHERE ri.id = v.id`,
        [ids, weights],
      );
    }

    // Update total amount pada tabel rab
    await this.db.query('UPDATE rab SET total_amount = $1, updated_at = now() WHERE id = $2', [totalRab, rabId]);
  }
}
