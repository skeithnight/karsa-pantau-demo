import { Injectable, NotFoundException, ForbiddenException } from '@nestjs/common';
import { DatabaseService } from '../../database/database.service';
import { SubscriptionsService } from '../subscriptions/subscriptions.service';
import {
  Organization,
  OrganizationMember,
  CreateOrganizationDto,
  InviteMemberDto,
  UserRole,
} from '@karsa/shared-types';
import * as bcrypt from 'bcrypt';

@Injectable()
export class OrganizationsService {
  constructor(
    private readonly db: DatabaseService,
    private readonly subscriptionsService: SubscriptionsService,
  ) {}

  /**
   * Membuat organisasi (tenant) baru dan otomatis memberikan 14-day PRO Trial
   */
  async createOrganization(userId: string, dto: CreateOrganizationDto): Promise<Organization> {
    const rawSlug = dto.slug || dto.name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
    let slug = rawSlug;

    // Cek slug collision
    const existing = await this.db.query<any>(`SELECT id FROM organizations WHERE slug = $1`, [slug]);
    if (existing.rows.length > 0) {
      slug = `${rawSlug}-${Math.floor(1000 + Math.random() * 9000)}`;
    }

    // 1. Buat Organisasi
    const orgRes = await this.db.query<any>(
      `INSERT INTO organizations (name, slug, status)
       VALUES ($1, $2, 'active')
       RETURNING id, name, slug, logo_url as "logoUrl", status, created_at as "createdAt", updated_at as "updatedAt"`,
      [dto.name, slug],
    );
    const org = orgRes.rows[0];

    // 2. Daftarkan pembuat sebagai Admin Organisasi
    await this.db.query(
      `INSERT INTO organization_members (organization_id, user_id, role, is_active)
       VALUES ($1, $2, $3, true)`,
      [org.id, userId, UserRole.ADMIN],
    );

    // 3. Daftarkan Trial Subscription 14 Hari (Paket PRO)
    const planRes = await this.db.query<any>(
      `SELECT id FROM subscription_plans WHERE code = 'PRO' LIMIT 1`,
    );
    const planId = planRes.rows[0]?.id;

    if (planId) {
      await this.db.query(
        `INSERT INTO subscriptions (organization_id, plan_id, status, billing_cycle, current_period_start, current_period_end, trial_ends_at)
         VALUES ($1, $2, 'trialing', 'monthly', now(), now() + INTERVAL '14 days', now() + INTERVAL '14 days')`,
        [org.id, planId],
      );
    }

    return {
      ...org,
      memberCount: 1,
      activeProjectsCount: 0,
      currentPlan: 'PRO (Trial 14 Hari)',
    };
  }

  /**
   * Mengambil daftar seluruh organisasi yang diikuti oleh user
   */
  async getUserOrganizations(userId: string): Promise<any[]> {
    const res = await this.db.query<any>(
      `SELECT o.id, o.name, o.slug, o.logo_url as "logoUrl", o.status,
              om.role as "myRole",
              (SELECT COUNT(*)::int FROM organization_members WHERE organization_id = o.id AND is_active = true) as "memberCount",
              (SELECT COUNT(*)::int FROM projects WHERE organization_id = o.id AND status != 'completed') as "activeProjectsCount",
              (SELECT p.name FROM subscriptions s JOIN subscription_plans p ON s.plan_id = p.id WHERE s.organization_id = o.id ORDER BY s.created_at DESC LIMIT 1) as "currentPlan",
              o.created_at as "createdAt"
       FROM organizations o
       JOIN organization_members om ON o.id = om.organization_id
       WHERE om.user_id = $1 AND om.is_active = true
       ORDER BY o.created_at ASC`,
      [userId],
    );

    return res.rows;
  }

  /**
   * Mengambil detail satu organisasi
   */
  async getOrganizationById(orgId: string, userId: string): Promise<Organization> {
    const res = await this.db.query<any>(
      `SELECT o.id, o.name, o.slug, o.logo_url as "logoUrl", o.status,
              o.created_at as "createdAt", o.updated_at as "updatedAt",
              (SELECT COUNT(*)::int FROM organization_members WHERE organization_id = o.id AND is_active = true) as "memberCount",
              (SELECT COUNT(*)::int FROM projects WHERE organization_id = o.id AND status != 'completed') as "activeProjectsCount",
              (SELECT p.name FROM subscriptions s JOIN subscription_plans p ON s.plan_id = p.id WHERE s.organization_id = o.id ORDER BY s.created_at DESC LIMIT 1) as "currentPlan"
       FROM organizations o
       JOIN organization_members om ON o.id = om.organization_id
       WHERE o.id = $1 AND om.user_id = $2
       LIMIT 1`,
      [orgId, userId],
    );

    if (res.rows.length === 0) {
      throw new NotFoundException('Organisasi tidak ditemukan atau Anda tidak memiliki akses.');
    }

    return res.rows[0];
  }

  /**
   * Mengambil daftar anggota tim dalam organisasi
   */
  async getMembers(orgId: string, userId: string): Promise<OrganizationMember[]> {
    // Validasi akses keanggotaan
    const check = await this.db.query<any>(
      `SELECT id FROM organization_members WHERE organization_id = $1 AND user_id = $2 AND is_active = true`,
      [orgId, userId],
    );
    if (check.rows.length === 0) {
      throw new ForbiddenException('Anda bukan anggota dari organisasi ini.');
    }

    const res = await this.db.query<any>(
      `SELECT om.id, om.organization_id as "organizationId", om.user_id as "userId",
              om.role, om.is_active as "isActive", om.created_at as "createdAt",
              u.name as "userName", u.email as "userEmail"
       FROM organization_members om
       JOIN users u ON om.user_id = u.id
       WHERE om.organization_id = $1 AND om.is_active = true
       ORDER BY om.created_at ASC`,
      [orgId],
    );

    return res.rows;
  }

  /**
   * Mengundang atau menambahkan anggota baru ke dalam tim organisasi
   */
  async inviteMember(orgId: string, inviterId: string, dto: InviteMemberDto): Promise<OrganizationMember> {
    // 1. Validasi hak akses inviter (harus Admin atau PM)
    const inviterCheck = await this.db.query<any>(
      `SELECT role FROM organization_members WHERE organization_id = $1 AND user_id = $2 AND is_active = true`,
      [orgId, inviterId],
    );
    if (inviterCheck.rows.length === 0 || (inviterCheck.rows[0].role !== UserRole.ADMIN && inviterCheck.rows[0].role !== UserRole.PM)) {
      throw new ForbiddenException('Hanya Admin atau PM organisasi yang dapat mengundang anggota tim.');
    }

    // 2. Validasi kuota kapasitas user paket
    await this.subscriptionsService.checkUserQuota(orgId);

    // 3. Cek apakah user dengan email tersebut sudah ada di sistem
    let targetUserId: string;
    const userRes = await this.db.query<any>(`SELECT id FROM users WHERE email = $1`, [dto.email]);

    if (userRes.rows.length > 0) {
      targetUserId = userRes.rows[0].id;
    } else {
      // Buat akun baru dengan default password
      const passHash = await bcrypt.hash('Password123!', 10);
      const newUser = await this.db.query<any>(
        `INSERT INTO users (name, email, password_hash, role)
         VALUES ($1, $2, $3, $4)
         RETURNING id`,
        [dto.name || dto.email.split('@')[0], dto.email, passHash, dto.role],
      );
      targetUserId = newUser.rows[0].id;
    }

    // 4. Masukkan ke organization_members
    const memRes = await this.db.query<any>(
      `INSERT INTO organization_members (organization_id, user_id, role, is_active)
       VALUES ($1, $2, $3, true)
       ON CONFLICT (organization_id, user_id) 
       DO UPDATE SET role = EXCLUDED.role, is_active = true, updated_at = now()
       RETURNING id, organization_id as "organizationId", user_id as "userId", role, is_active as "isActive", created_at as "createdAt"`,
      [orgId, targetUserId, dto.role],
    );

    return {
      ...memRes.rows[0],
      userEmail: dto.email,
      userName: dto.name || dto.email.split('@')[0],
    };
  }

  /**
   * Menghapus anggota tim dari organisasi
   */
  async removeMember(orgId: string, inviterId: string, memberId: string): Promise<{ success: boolean }> {
    const inviterCheck = await this.db.query<any>(
      `SELECT role FROM organization_members WHERE organization_id = $1 AND user_id = $2 AND is_active = true`,
      [orgId, inviterId],
    );
    if (inviterCheck.rows.length === 0 || inviterCheck.rows[0].role !== UserRole.ADMIN) {
      throw new ForbiddenException('Hanya Admin organisasi yang dapat menghapus anggota tim.');
    }

    await this.db.query(
      `DELETE FROM organization_members WHERE organization_id = $1 AND id = $2`,
      [orgId, memberId],
    );

    return { success: true };
  }
}
