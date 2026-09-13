import { Injectable, BadRequestException, NotFoundException } from '@nestjs/common';
import { DatabaseService } from '../../database/database.service';
import { VarianceCalculatorService } from './variance-calculator.service';
import { RabStatus, ActualSource } from '@karsa/shared-types';

@Injectable()
export class ActualsService {
  constructor(
    private readonly db: DatabaseService,
    private readonly varianceCalculator: VarianceCalculatorService,
  ) {}

  async findByRabItem(rabItemId: string) {
    const res = await this.db.query(
      `SELECT ae.*, u.name as entered_by_name
       FROM actual_entries ae
       LEFT JOIN users u ON u.id = ae.entered_by
       WHERE ae.rab_item_id = $1
       ORDER BY ae.entry_date DESC, ae.created_at DESC`,
      [rabItemId],
    );
    return res.rows.map((row) => ({
      ...row,
      qty: parseFloat(row.qty),
      actual_unit_price: parseFloat(row.actual_unit_price),
      total_actual_amount: parseFloat(row.total_actual_amount),
    }));
  }

  async create(
    rabItemId: string,
    data: {
      clientGeneratedId?: string;
      idempotencyKey?: string;
      entryDate: string;
      qty: number;
      actualUnitPrice: number;
      vendor: string;
      invoiceNumber?: string;
      description?: string;
      source?: ActualSource;
      attachmentUrls?: string[];
    },
    userId: string,
  ) {
    // 1. Idempotency check
    if (data.idempotencyKey) {
      const existing = await this.db.query('SELECT * FROM actual_entries WHERE idempotency_key = $1', [
        data.idempotencyKey,
      ]);
      if (existing.rows[0]) {
        return existing.rows[0];
      }
    }

    // 2. Validate RAB Item and RAB Status
    const itemRes = await this.db.query(
      `SELECT ri.*, r.status as rab_status
       FROM rab_items ri
       JOIN rab r ON r.id = ri.rab_id
       WHERE ri.id = $1`,
      [rabItemId],
    );
    const item = itemRes.rows[0];
    if (!item) {
      throw new NotFoundException(`Item RAB dengan ID '${rabItemId}' tidak ditemukan`);
    }

    // CRITICAL GUARDRAIL: RAB berstatus draft/submitted tidak boleh menerima input actual_entries
    if (item.rab_status !== RabStatus.APPROVED) {
      throw new BadRequestException(
        `Dilarang mencatat realisasi pada RAB berstatus '${item.rab_status}'. Hanya RAB berstatus 'approved' yang dapat menerima input realisasi.`,
      );
    }

    // 3. Hitung variance kumulatif
    const currentActualsRes = await this.db.query(
      'SELECT COALESCE(SUM(total_actual_amount), 0) as current_total FROM actual_entries WHERE rab_item_id = $1',
      [rabItemId],
    );
    const currentTotal = parseFloat(currentActualsRes.rows[0].current_total);
    const newEntryTotal = this.varianceCalculator.calculateTotalActual(data.qty, data.actualUnitPrice);
    const projectedTotal = currentTotal + newEntryTotal;
    const isDiscrepancy = this.varianceCalculator.isOverbudget(parseFloat(item.subtotal), projectedTotal, 10); // alert jika > +10%

    // 4. Insert actual entry
    const insertQuery = `
      INSERT INTO actual_entries (
        ${data.clientGeneratedId ? 'id,' : ''}
        rab_item_id, item_code, idempotency_key, entry_date, qty, actual_unit_price,
        vendor, invoice_number, description, entered_by, source, is_discrepancy
      ) VALUES (
        ${data.clientGeneratedId ? '$1,' : ''}
        $${data.clientGeneratedId ? 2 : 1},
        $${data.clientGeneratedId ? 3 : 2},
        $${data.clientGeneratedId ? 4 : 3},
        $${data.clientGeneratedId ? 5 : 4},
        $${data.clientGeneratedId ? 6 : 5},
        $${data.clientGeneratedId ? 7 : 6},
        $${data.clientGeneratedId ? 8 : 7},
        $${data.clientGeneratedId ? 9 : 8},
        $${data.clientGeneratedId ? 10 : 9},
        $${data.clientGeneratedId ? 11 : 10},
        $${data.clientGeneratedId ? 12 : 11},
        $${data.clientGeneratedId ? 13 : 12}
      ) RETURNING *
    `;

    const values: any[] = [];
    if (data.clientGeneratedId) values.push(data.clientGeneratedId);
    values.push(
      rabItemId,
      item.item_code,
      data.idempotencyKey || null,
      data.entryDate,
      data.qty,
      data.actualUnitPrice,
      data.vendor,
      data.invoiceNumber || null,
      data.description || null,
      userId,
      data.source || ActualSource.MANUAL,
      isDiscrepancy,
    );

    const res = await this.db.query(insertQuery, values);
    const createdEntry = res.rows[0];

    // Hubungkan attachments jika ada
    if (data.attachmentUrls && data.attachmentUrls.length > 0) {
      for (const url of data.attachmentUrls) {
        await this.db.query(
          `INSERT INTO attachments (actual_entry_id, project_id, file_url, file_name, mime_type, file_size_bytes, uploaded_by)
           VALUES ($1, $2, $3, $4, 'image/jpeg', 0, $5)`,
          [createdEntry.id, item.project_id, url, 'nota-bukti.jpg', userId],
        );
      }
    }

    return {
      ...createdEntry,
      qty: parseFloat(createdEntry.qty),
      actual_unit_price: parseFloat(createdEntry.actual_unit_price),
      total_actual_amount: parseFloat(createdEntry.total_actual_amount),
      is_overbudget: isDiscrepancy,
    };
  }
}
