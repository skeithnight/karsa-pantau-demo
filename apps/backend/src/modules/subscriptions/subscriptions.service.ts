import { Injectable, NotFoundException, ForbiddenException } from '@nestjs/common';
import { DatabaseService } from '../../database/database.service';
import {
  SubscriptionPlan,
  SubscriptionUsage,
  SubscriptionInvoice,
  PlanCode,
  BillingCycle,
  SubscriptionStatus,
  CheckoutPlanDto,
} from '@karsa/shared-types';

@Injectable()
export class SubscriptionsService {
  constructor(private readonly db: DatabaseService) {}

  /**
   * Mengambil seluruh katalog paket langganan aktif
   */
  async getAllPlans(): Promise<SubscriptionPlan[]> {
    const res = await this.db.query<any>(
      `SELECT id, code, name, description, 
              price_monthly as "priceMonthly", 
              price_yearly as "priceYearly", 
              max_projects as "maxProjects", 
              max_users as "maxUsers", 
              max_storage_gb as "maxStorageGb", 
              ai_quota_per_month as "aiQuotaPerMonth", 
              features, is_active as "isActive"
       FROM subscription_plans
       WHERE is_active = true
       ORDER BY price_monthly ASC`,
    );

    return res.rows.map((r) => ({
      ...r,
      priceMonthly: Number(r.priceMonthly),
      priceYearly: Number(r.priceYearly),
      features: typeof r.features === 'string' ? JSON.parse(r.features) : r.features,
    }));
  }

  /**
   * Mengambil detail kuota pemakaian organisasi (Projects, Users, AI credits, Days remaining)
   */
  async getSubscriptionUsage(organizationId: string): Promise<SubscriptionUsage> {
    // 1. Ambil subscription aktif
    const subRes = await this.db.query<any>(
      `SELECT s.id, s.status, s.billing_cycle, s.current_period_end, s.trial_ends_at,
              p.code as plan_code, p.name as plan_name, p.max_projects, p.max_users, p.ai_quota_per_month
       FROM subscriptions s
       JOIN subscription_plans p ON s.plan_id = p.id
       WHERE s.organization_id = $1
       ORDER BY s.created_at DESC
       LIMIT 1`,
      [organizationId],
    );

    if (subRes.rows.length === 0) {
      throw new NotFoundException('Data langganan untuk organisasi ini tidak ditemukan.');
    }

    const sub = subRes.rows[0];

    // 2, 3, 4: Hitung penggunaan proyek, anggota tim, dan kuota AI secara paralel (P7)
    const [projCountRes, userCountRes, aiCountRes] = await Promise.all([
      this.db.query<any>(
        `SELECT COUNT(*)::int as count FROM projects WHERE organization_id = $1 AND status != 'completed'`,
        [organizationId],
      ),
      this.db.query<any>(
        `SELECT COUNT(*)::int as count FROM organization_members WHERE organization_id = $1 AND is_active = true`,
        [organizationId],
      ),
      this.db.query<any>(
        `SELECT COUNT(*)::int as count 
         FROM ai_insights 
         WHERE organization_id = $1 
           AND created_at >= date_trunc('month', now())`,
        [organizationId],
      ),
    ]);
    const projectsUsed = projCountRes.rows[0]?.count || 0;
    const usersUsed = userCountRes.rows[0]?.count || 0;
    const aiQuotaUsed = aiCountRes.rows[0]?.count || 0;

    const periodEnd = new Date(sub.current_period_end);
    const now = new Date();
    const diffTime = periodEnd.getTime() - now.getTime();
    const daysRemaining = Math.max(0, Math.ceil(diffTime / (1000 * 60 * 60 * 24)));

    return {
      planCode: sub.plan_code as PlanCode,
      planName: sub.plan_name,
      status: sub.status as SubscriptionStatus,
      billingCycle: sub.billing_cycle as BillingCycle,
      currentPeriodEnd: sub.current_period_end,
      daysRemaining,
      projectsUsed,
      projectsLimit: sub.max_projects,
      usersUsed,
      usersLimit: sub.max_users,
      aiQuotaUsed,
      aiQuotaLimit: sub.ai_quota_per_month,
      isTrial: sub.status === 'trialing' || sub.plan_code === 'TRIAL',
    };
  }

  /**
   * Guardrail: Memeriksa apakah organisasi masih memiliki kuota untuk membuat proyek baru
   */
  async checkProjectQuota(organizationId: string): Promise<void> {
    const usage = await this.getSubscriptionUsage(organizationId);

    if (usage.status === SubscriptionStatus.EXPIRED || usage.status === SubscriptionStatus.PAST_DUE) {
      throw new ForbiddenException(
        `Langganan organisasi Anda berstatus ${usage.status}. Harap perpanjang paket untuk melanjutkan pembuatan proyek.`,
      );
    }

    if (usage.projectsUsed >= usage.projectsLimit) {
      throw new ForbiddenException(
        `Batas kuota proyek untuk paket ${usage.planName} (${usage.projectsLimit} proyek) telah tercapai. Harap upgrade paket Anda untuk menambah proyek baru.`,
      );
    }
  }

  /**
   * Guardrail: Memeriksa apakah organisasi masih memiliki kuota untuk menambah anggota tim
   */
  async checkUserQuota(organizationId: string): Promise<void> {
    const usage = await this.getSubscriptionUsage(organizationId);

    if (usage.usersUsed >= usage.usersLimit) {
      throw new ForbiddenException(
        `Batas kuota pengguna untuk paket ${usage.planName} (${usage.usersLimit} pengguna) telah tercapai. Harap upgrade paket Anda untuk menambah anggota tim baru.`,
      );
    }
  }

  /**
   * Proses Checkout / Upgrade Paket Langganan
   */
  async checkoutPlan(organizationId: string, dto: CheckoutPlanDto): Promise<{ invoice: SubscriptionInvoice; paymentUrl?: string }> {
    // 1. Cari plan tujuan
    const planRes = await this.db.query<any>(
      `SELECT id, code, name, price_monthly, price_yearly FROM subscription_plans WHERE code = $1 AND is_active = true`,
      [dto.planCode],
    );

    if (planRes.rows.length === 0) {
      throw new NotFoundException(`Paket dengan kode ${dto.planCode} tidak ditemukan.`);
    }

    const plan = planRes.rows[0];
    const isYearly = dto.billingCycle === BillingCycle.YEARLY;
    const amount = Number(isYearly ? plan.price_yearly : plan.price_monthly);

    // 2. Ambil subscription saat ini
    const subRes = await this.db.query<any>(
      `SELECT id FROM subscriptions WHERE organization_id = $1 ORDER BY created_at DESC LIMIT 1`,
      [organizationId],
    );

    let subscriptionId = subRes.rows[0]?.id;

    if (!subscriptionId) {
      const newSub = await this.db.query<any>(
        `INSERT INTO subscriptions (organization_id, plan_id, status, billing_cycle, current_period_start, current_period_end)
         VALUES ($1, $2, 'active', $3, now(), now() + ($4 || ' days')::interval)
         RETURNING id`,
        [organizationId, plan.id, dto.billingCycle, isYearly ? '365' : '30'],
      );
      subscriptionId = newSub.rows[0].id;
    }

    // 3. Buat Invoice Baru
    const invoiceNumber = `INV-${Date.now()}-${Math.floor(1000 + Math.random() * 9000)}`;
    const invoiceNotes = JSON.stringify({
      targetPlanId: plan.id,
      targetPlanCode: plan.code,
      billingCycle: dto.billingCycle,
    });

    const invRes = await this.db.query<any>(
      `INSERT INTO subscription_invoices (organization_id, subscription_id, invoice_number, amount, status, payment_method, notes)
       VALUES ($1, $2, $3, $4, 'pending', $5, $6)
       RETURNING id, organization_id as "organizationId", subscription_id as "subscriptionId",
                 invoice_number as "invoiceNumber", amount, status, payment_method as "paymentMethod",
                 notes, created_at as "createdAt"`,
      [organizationId, subscriptionId, invoiceNumber, amount, dto.paymentMethod || 'MANUAL_BANK_TRANSFER', invoiceNotes],
    );

    const invoice = invRes.rows[0];
    invoice.amount = Number(invoice.amount);

    return {
      invoice,
      paymentUrl: `/settings/billing?invoice=${invoice.id}`,
    };
  }

  /**
   * Konfirmasi Pembayaran Invoice (Simulasi atau Upload Bukti Transfer)
   */
  async confirmInvoicePayment(invoiceId: string, proofUrl?: string): Promise<SubscriptionInvoice> {
    const invRes = await this.db.query<any>(
      `SELECT id, organization_id, subscription_id, amount, status, notes FROM subscription_invoices WHERE id = $1`,
      [invoiceId],
    );

    if (invRes.rows.length === 0) {
      throw new NotFoundException('Faktur tidak ditemukan.');
    }

    const inv = invRes.rows[0];

    // Update invoice status ke 'paid'
    const updatedInv = await this.db.query<any>(
      `UPDATE subscription_invoices
       SET status = 'paid', paid_at = now(), payment_proof_url = $2
       WHERE id = $1
       RETURNING id, organization_id as "organizationId", subscription_id as "subscriptionId",
                 invoice_number as "invoiceNumber", amount, status, payment_method as "paymentMethod",
                 payment_proof_url as "paymentProofUrl", paid_at as "paidAt", created_at as "createdAt"`,
      [invoiceId, proofUrl || null],
    );

    let targetPlanId: string | null = null;
    let targetBillingCycle: BillingCycle | null = null;
    if (inv.notes) {
      try {
        const parsed = JSON.parse(inv.notes);
        if (parsed.targetPlanId) targetPlanId = parsed.targetPlanId;
        if (parsed.billingCycle) targetBillingCycle = parsed.billingCycle;
      } catch {
        // ignore
      }
    }

    // Ambil detail subscription terkait dan update status ke 'active'
    const subRes = await this.db.query<any>(
      `SELECT id, plan_id, billing_cycle FROM subscriptions WHERE id = $1`,
      [inv.subscription_id],
    );

    if (subRes.rows.length > 0) {
      const sub = subRes.rows[0];
      const cycle = targetBillingCycle || sub.billing_cycle;
      const isYearly = cycle === 'yearly';
      const durationDays = isYearly ? 365 : 30;

      await this.db.query(
        `UPDATE subscriptions
         SET status = 'active',
             plan_id = COALESCE($2, plan_id),
             billing_cycle = $3,
             current_period_start = now(),
             current_period_end = now() + ($4 || ' days')::interval,
             updated_at = now()
         WHERE id = $1`,
        [sub.id, targetPlanId, cycle, durationDays],
      );
    }

    // Pastikan status organization juga aktif
    await this.db.query(
      `UPDATE organizations SET status = 'active', updated_at = now() WHERE id = $1`,
      [inv.organization_id],
    );

    const result = updatedInv.rows[0];
    result.amount = Number(result.amount);
    return result;
  }

  /**
   * Mengambil riwayat invoice organisasi
   */
  async getInvoices(organizationId: string): Promise<SubscriptionInvoice[]> {
    const res = await this.db.query<any>(
      `SELECT id, organization_id as "organizationId", subscription_id as "subscriptionId",
              invoice_number as "invoiceNumber", amount, status, payment_method as "paymentMethod",
              payment_proof_url as "paymentProofUrl", paid_at as "paidAt", created_at as "createdAt"
       FROM subscription_invoices
       WHERE organization_id = $1
       ORDER BY created_at DESC`,
      [organizationId],
    );

    return res.rows.map((r) => ({
      ...r,
      amount: Number(r.amount),
    }));
  }
}
