import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { DatabaseService } from '../../database/database.service';

export interface CreatePettyCashDto {
  transactionType?: string;
  amount: number;
  recipientName: string;
  purpose: string;
  costCategory?: string;
  receiptUrl?: string;
  geotag?: any;
}

export interface SettlePettyCashDto {
  settlementAmount: number;
  settlementNotes?: string;
  receiptUrl?: string;
  geotag?: any;
}

@Injectable()
export class PettyCashService {
  constructor(private readonly db: DatabaseService) {}

  async getTransactions(projectId: string, status?: string) {
    let sql = `
      SELECT pc.*, 
             u.name as requester_name, 
             u.email as requester_email,
             ap.name as approver_name
      FROM petty_cash_transactions pc
      LEFT JOIN users u ON u.id = pc.created_by
      LEFT JOIN users ap ON ap.id = pc.approved_by
      WHERE pc.project_id = $1
    `;
    const params: any[] = [projectId];

    if (status) {
      sql += ` AND pc.status = $2`;
      params.push(status);
    }

    sql += ` ORDER BY pc.created_at DESC`;

    const res = await this.db.query(sql, params);
    return res.rows.map((r) => ({
      ...r,
      amount: parseFloat(r.amount),
      settlement_amount: r.settlement_amount ? parseFloat(r.settlement_amount) : null,
    }));
  }

  async getSummary(projectId: string) {
    const res = await this.db.query(
      `SELECT
         COALESCE(SUM(CASE WHEN status = 'disbursed' THEN amount ELSE 0 END), 0) as outstanding_amount,
         COALESCE(SUM(CASE WHEN status = 'settled' THEN settlement_amount ELSE 0 END), 0) as total_settled_amount,
         COALESCE(SUM(CASE WHEN status = 'submitted' THEN amount ELSE 0 END), 0) as pending_approval_amount,
         COUNT(CASE WHEN status = 'submitted' THEN 1 END)::int as pending_approval_count,
         COUNT(CASE WHEN status = 'disbursed' THEN 1 END)::int as outstanding_count,
         COUNT(CASE WHEN status = 'settled' THEN 1 END)::int as settled_count
       FROM petty_cash_transactions
       WHERE project_id = $1`,
      [projectId],
    );

    const row = res.rows[0];
    const outstanding = parseFloat(row.outstanding_amount || '0');
    const settled = parseFloat(row.total_settled_amount || '0');
    const pending = parseFloat(row.pending_approval_amount || '0');
    
    // Asumsi pagu kas kecil lapangan (Petty Cash Pool) default Rp 15.000.000
    const defaultSitePool = 15000000;
    const availablePool = Math.max(0, defaultSitePool - outstanding);

    return {
      sitePoolLimit: defaultSitePool,
      availablePool,
      outstandingAmount: outstanding,
      totalSettledAmount: settled,
      pendingApprovalAmount: pending,
      pendingApprovalCount: row.pending_approval_count,
      outstandingCount: row.outstanding_count,
      settledCount: row.settled_count,
    };
  }

  async createRequest(projectId: string, dto: CreatePettyCashDto, userId?: string) {
    if (!dto.amount || dto.amount <= 0) {
      throw new BadRequestException('Nominal kasbon harus lebih besar dari 0.');
    }
    if (!dto.recipientName || !dto.purpose) {
      throw new BadRequestException('Nama penerima kasbon dan tujuan penggunaan wajib diisi.');
    }

    const res = await this.db.query(
      `INSERT INTO petty_cash_transactions (
         project_id, transaction_type, amount, recipient_name, purpose,
         cost_category, status, receipt_url, geotag, created_by
       ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9::jsonb, $10)
       RETURNING *`,
      [
        projectId,
        dto.transactionType || 'kasbon_request',
        dto.amount,
        dto.recipientName,
        dto.purpose,
        dto.costCategory || 'overhead',
        'submitted',
        dto.receiptUrl || null,
        JSON.stringify(dto.geotag || {}),
        userId || null,
      ],
    );

    const row = res.rows[0];
    return {
      ...row,
      amount: parseFloat(row.amount),
    };
  }

  async approveRequest(id: string, approverId?: string) {
    const existing = await this.db.query(
      'SELECT id, status, created_by FROM petty_cash_transactions WHERE id = $1',
      [id],
    );
    if (existing.rows.length === 0) {
      throw new NotFoundException(`Pengajuan kasbon ${id} tidak ditemukan.`);
    }
    const item = existing.rows[0];
    if (item.status !== 'submitted') {
      throw new BadRequestException(`Hanya pengajuan berstatus 'submitted' yang dapat disetujui (status saat ini: ${item.status}).`);
    }
    if (approverId && item.created_by && item.created_by === approverId) {
      throw new BadRequestException('Prinsip SoD: Pembuat pengajuan kasbon tidak boleh menyetujui pengajuannya sendiri.');
    }

    const res = await this.db.query(
      `UPDATE petty_cash_transactions
       SET status = 'approved', approved_by = $2
       WHERE id = $1
       RETURNING *`,
      [id, approverId || null],
    );

    return res.rows[0];
  }

  async disburseRequest(id: string) {
    const res = await this.db.query(
      `UPDATE petty_cash_transactions
       SET status = 'disbursed', disbursed_at = now()
       WHERE id = $1
       RETURNING *`,
      [id],
    );

    if (res.rows.length === 0) {
      throw new NotFoundException(`Pengajuan kasbon ${id} tidak ditemukan.`);
    }

    return res.rows[0];
  }

  async settleRequest(id: string, dto: SettlePettyCashDto) {
    if (dto.settlementAmount === undefined || dto.settlementAmount < 0) {
      throw new BadRequestException('Nominal realisasi nota pertanggungjawaban harus valid.');
    }

    const res = await this.db.query(
      `UPDATE petty_cash_transactions
       SET status = 'settled',
           settlement_amount = $2,
           settlement_notes = $3,
           receipt_url = COALESCE($4, receipt_url),
           geotag = COALESCE($5::jsonb, geotag)
       WHERE id = $1
       RETURNING *`,
      [
        id,
        dto.settlementAmount,
        dto.settlementNotes || null,
        dto.receiptUrl || null,
        dto.geotag ? JSON.stringify(dto.geotag) : null,
      ],
    );

    if (res.rows.length === 0) {
      throw new NotFoundException(`Pengajuan kasbon ${id} tidak ditemukan.`);
    }

    return res.rows[0];
  }

  async rejectRequest(id: string, reason?: string) {
    const res = await this.db.query(
      `UPDATE petty_cash_transactions
       SET status = 'rejected',
           settlement_notes = $2
       WHERE id = $1
       RETURNING *`,
      [id, reason ? `Ditolak: ${reason}` : 'Ditolak oleh Project Manager.'],
    );

    if (res.rows.length === 0) {
      throw new NotFoundException(`Pengajuan kasbon ${id} tidak ditemukan.`);
    }

    return res.rows[0];
  }
}
