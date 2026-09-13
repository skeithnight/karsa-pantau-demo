import { Test, TestingModule } from '@nestjs/testing';
import { SubscriptionsService } from '../subscriptions.service';
import { DatabaseService } from '../../../database/database.service';
import { ForbiddenException, NotFoundException } from '@nestjs/common';
import { PlanCode, BillingCycle, SubscriptionStatus } from '@karsa/shared-types';

describe('SubscriptionsService', () => {
  let service: SubscriptionsService;
  let db: { query: jest.Mock };

  beforeEach(async () => {
    db = {
      query: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        SubscriptionsService,
        { provide: DatabaseService, useValue: db },
      ],
    }).compile();

    service = module.get<SubscriptionsService>(SubscriptionsService);
  });

  describe('getAllPlans', () => {
    it('harus mengembalikan daftar seluruh paket langganan aktif dengan format angka', async () => {
      db.query.mockResolvedValueOnce({
        rows: [
          {
            id: 'plan-1',
            code: 'STARTER',
            name: 'Starter EPC',
            description: 'Untuk pemula',
            priceMonthly: '1500000',
            priceYearly: '15000000',
            maxProjects: 3,
            maxUsers: 5,
            maxStorageGb: 10,
            aiQuotaPerMonth: 150,
            features: '{"ocr": true}',
            isActive: true,
          },
        ],
      });

      const plans = await service.getAllPlans();
      expect(plans).toHaveLength(1);
      expect(plans[0].priceMonthly).toBe(1500000);
      expect(plans[0].features).toEqual({ ocr: true });
    });
  });

  describe('getSubscriptionUsage', () => {
    it('harus menghitung kuota dan hari tersisa dengan benar', async () => {
      const futureDate = new Date();
      futureDate.setDate(futureDate.getDate() + 10);

      // Mock subscription query
      db.query
        .mockResolvedValueOnce({
          rows: [
            {
              id: 'sub-1',
              status: 'active',
              billing_cycle: 'monthly',
              current_period_end: futureDate.toISOString(),
              plan_code: 'STARTER',
              plan_name: 'Starter EPC',
              max_projects: 3,
              max_users: 5,
              ai_quota_per_month: 150,
            },
          ],
        })
        // Mock project count
        .mockResolvedValueOnce({ rows: [{ count: 2 }] })
        // Mock user count
        .mockResolvedValueOnce({ rows: [{ count: 4 }] })
        // Mock ai count
        .mockResolvedValueOnce({ rows: [{ count: 25 }] });

      const usage = await service.getSubscriptionUsage('org-1');
      expect(usage.planCode).toBe(PlanCode.STARTER);
      expect(usage.projectsUsed).toBe(2);
      expect(usage.projectsLimit).toBe(3);
      expect(usage.usersUsed).toBe(4);
      expect(usage.usersLimit).toBe(5);
      expect(usage.aiQuotaUsed).toBe(25);
      expect(usage.daysRemaining).toBeGreaterThanOrEqual(9);
      expect(usage.isTrial).toBe(false);
    });

    it('harus throw NotFoundException jika subscription tidak ditemukan', async () => {
      db.query.mockResolvedValueOnce({ rows: [] });
      await expect(service.getSubscriptionUsage('org-unknown')).rejects.toThrow(NotFoundException);
    });
  });

  describe('checkProjectQuota', () => {
    it('harus throw ForbiddenException jika kuota proyek telah tercapai', async () => {
      jest.spyOn(service, 'getSubscriptionUsage').mockResolvedValueOnce({
        planCode: PlanCode.STARTER,
        planName: 'Starter EPC',
        status: SubscriptionStatus.ACTIVE,
        billingCycle: BillingCycle.MONTHLY,
        currentPeriodEnd: new Date().toISOString(),
        daysRemaining: 10,
        projectsUsed: 3,
        projectsLimit: 3,
        usersUsed: 2,
        usersLimit: 5,
        aiQuotaUsed: 10,
        aiQuotaLimit: 150,
        isTrial: false,
      });

      await expect(service.checkProjectQuota('org-1')).rejects.toThrow(ForbiddenException);
    });

    it('harus lolos jika proyek masih di bawah batas kuota', async () => {
      jest.spyOn(service, 'getSubscriptionUsage').mockResolvedValueOnce({
        planCode: PlanCode.PRO,
        planName: 'Pro',
        status: SubscriptionStatus.ACTIVE,
        billingCycle: BillingCycle.MONTHLY,
        currentPeriodEnd: new Date().toISOString(),
        daysRemaining: 10,
        projectsUsed: 2,
        projectsLimit: 15,
        usersUsed: 2,
        usersLimit: 25,
        aiQuotaUsed: 10,
        aiQuotaLimit: 1000,
        isTrial: false,
      });

      await expect(service.checkProjectQuota('org-1')).resolves.toBeUndefined();
    });
  });

  describe('checkoutPlan & confirmInvoicePayment', () => {
    it('harus membuat invoice pending untuk upgrade paket', async () => {
      db.query
        // 1. Plan search
        .mockResolvedValueOnce({
          rows: [
            {
              id: 'plan-pro',
              code: 'PRO',
              name: 'Pro',
              price_monthly: 4500000,
              price_yearly: 45000000,
            },
          ],
        })
        // 2. Existing sub
        .mockResolvedValueOnce({ rows: [{ id: 'sub-existing' }] })
        // 3. Insert invoice
        .mockResolvedValueOnce({
          rows: [
            {
              id: 'inv-1',
              organizationId: 'org-1',
              subscriptionId: 'sub-existing',
              invoiceNumber: 'INV-12345',
              amount: '4500000',
              status: 'pending',
              paymentMethod: 'MANUAL_BANK_TRANSFER',
              createdAt: new Date().toISOString(),
            },
          ],
        });

      const res = await service.checkoutPlan('org-1', {
        planCode: PlanCode.PRO,
        billingCycle: BillingCycle.MONTHLY,
      });

      expect(res.invoice.invoiceNumber).toBe('INV-12345');
      expect(res.invoice.amount).toBe(4500000);
      expect(res.invoice.status).toBe('pending');
    });

    it('harus mengaktifkan paket saat invoice dikonfirmasi', async () => {
      db.query
        // 1. Query invoice
        .mockResolvedValueOnce({
          rows: [{ id: 'inv-1', subscription_id: 'sub-1', amount: 4500000, status: 'pending' }],
        })
        // 2. Update invoice to paid
        .mockResolvedValueOnce({
          rows: [
            {
              id: 'inv-1',
              organizationId: 'org-1',
              subscriptionId: 'sub-1',
              invoiceNumber: 'INV-12345',
              amount: 4500000,
              status: 'paid',
              paidAt: new Date().toISOString(),
            },
          ],
        })
        // 3. Query subscription
        .mockResolvedValueOnce({
          rows: [{ id: 'sub-1', plan_id: 'plan-pro', billing_cycle: 'monthly' }],
        })
        // 4. Update subscription
        .mockResolvedValueOnce({ rowCount: 1 });

      const paid = await service.confirmInvoicePayment('inv-1', 'https://storage/proof.jpg');
      expect(paid.status).toBe('paid');
      expect(paid.amount).toBe(4500000);
    });
  });
});
