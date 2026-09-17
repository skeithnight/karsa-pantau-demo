import { PettyCashService } from '../petty-cash.service';
import { DatabaseService } from '../../../database/database.service';
import { BadRequestException } from '@nestjs/common';

describe('PettyCashService', () => {
  let service: PettyCashService;
  let mockDb: Partial<DatabaseService>;

  beforeEach(() => {
    mockDb = {
      query: jest.fn(),
    };
    service = new PettyCashService(mockDb as DatabaseService);
  });

  describe('createRequest', () => {
    it('should throw BadRequestException if amount <= 0', async () => {
      await expect(
        service.createRequest('proj-1', {
          amount: 0,
          recipientName: 'Sugi',
          purpose: 'Beli solar',
        }),
      ).rejects.toThrow(BadRequestException);
    });

    it('should throw BadRequestException if recipientName is missing', async () => {
      await expect(
        service.createRequest('proj-1', {
          amount: 100000,
          recipientName: '',
          purpose: 'Beli solar',
        }),
      ).rejects.toThrow(BadRequestException);
    });

    it('should insert and return parsed row', async () => {
      (mockDb.query as jest.Mock).mockResolvedValue({
        rows: [
          {
            id: 'pc-1',
            amount: '500000',
            recipient_name: 'Sugi',
            purpose: 'Beli solar',
            status: 'submitted',
          },
        ],
      });

      const res = await service.createRequest('proj-1', {
        amount: 500000,
        recipientName: 'Sugi',
        purpose: 'Beli solar',
      });

      expect(res.id).toBe('pc-1');
      expect(res.amount).toBe(500000);
    });
  });

  describe('getSummary', () => {
    it('should compute available pool, outstanding and settled correctly', async () => {
      (mockDb.query as jest.Mock).mockResolvedValue({
        rows: [
          {
            outstanding_amount: '2000000',
            total_settled_amount: '5000000',
            pending_approval_amount: '800000',
            pending_approval_count: 1,
            outstanding_count: 2,
            settled_count: 5,
          },
        ],
      });

      const summary = await service.getSummary('proj-1');
      expect(summary.sitePoolLimit).toBe(15000000);
      expect(summary.outstandingAmount).toBe(2000000);
      expect(summary.availablePool).toBe(13000000); // 15jt - 2jt
      expect(summary.totalSettledAmount).toBe(5000000);
      expect(summary.pendingApprovalAmount).toBe(800000);
    });
  });

  describe('approveRequest', () => {
    it('should throw BadRequestException on SoD violation if creator attempts to approve self-request', async () => {
      (mockDb.query as jest.Mock).mockResolvedValueOnce({
        rows: [{ id: 'pc-1', status: 'submitted', created_by: 'user-creator' }],
      });

      await expect(service.approveRequest('pc-1', 'user-creator')).rejects.toThrow(
        /Prinsip SoD/,
      );
    });

    it('should throw BadRequestException if request is not in submitted state', async () => {
      (mockDb.query as jest.Mock).mockResolvedValueOnce({
        rows: [{ id: 'pc-1', status: 'approved', created_by: 'user-creator' }],
      });

      await expect(service.approveRequest('pc-1', 'user-approver')).rejects.toThrow(
        /Hanya pengajuan berstatus 'submitted'/,
      );
    });

    it('should successfully approve request when approver differs from creator', async () => {
      (mockDb.query as jest.Mock)
        .mockResolvedValueOnce({
          rows: [{ id: 'pc-1', status: 'submitted', created_by: 'user-creator' }],
        })
        .mockResolvedValueOnce({
          rows: [{ id: 'pc-1', status: 'approved', approved_by: 'user-approver' }],
        });

      const res = await service.approveRequest('pc-1', 'user-approver');
      expect(res.status).toBe('approved');
      expect(res.approved_by).toBe('user-approver');
    });
  });
});
