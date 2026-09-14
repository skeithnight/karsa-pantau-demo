import { DailyLogsService } from '../daily-logs.service';
import { DatabaseService } from '../../../database/database.service';

describe('DailyLogsService', () => {
  let service: DailyLogsService;
  let mockDb: Partial<DatabaseService>;

  beforeEach(() => {
    mockDb = {
      query: jest.fn(),
    };
    service = new DailyLogsService(mockDb as DatabaseService);
  });

  describe('calculateEotSummary', () => {
    it('should return zero state if no logs exist', async () => {
      (mockDb.query as jest.Mock).mockResolvedValue({ rows: [] });

      const result = await service.calculateEotSummary('proj-123');
      expect(result.totalDaysLogged).toBe(0);
      expect(result.totalHoursLost).toBe(0);
      expect(result.eotDaysClaimable).toBe(0);
      expect(result.recommendation).toContain('Belum ada log');
    });

    it('should accurately calculate EOT days claimable and rain days', async () => {
      (mockDb.query as jest.Mock).mockResolvedValue({
        rows: [
          {
            total_days_logged: 1,
            total_hours_lost: '4.0',
            total_hours_effective: '4.0',
            rain_days_count: 1,
            manpower_data: [
              { role: 'Mandor', count: 2 },
              { role: 'Tukang', count: 10 },
            ],
            equipment_data: [
              { name: 'Excavator', status: 'beroperasi', hours: 4 },
              { name: 'Crane', status: 'standby', hours: 0 },
            ],
          },
          {
            total_days_logged: 1,
            total_hours_lost: '8.0',
            total_hours_effective: '0.0',
            rain_days_count: 1,
            manpower_data: [
              { role: 'Mandor', count: 2 },
              { role: 'Tukang', count: 12 },
            ],
            equipment_data: [
              { name: 'Excavator', status: 'standby', hours: 0 },
            ],
          },
        ],
      });

      const result = await service.calculateEotSummary('proj-123');
      expect(result.totalDaysLogged).toBe(2);
      expect(result.totalHoursLost).toBe(12);
      expect(result.eotDaysClaimable).toBe(1.5); // 12 / 8 = 1.5 days
      expect(result.rainDaysCount).toBe(2);
      expect(result.averageWorkersDaily).toBe(13); // (12 + 14) / 2 = 13
      expect(result.recommendation).toContain('Berita Acara Keterlambatan Cuaca (EOT Claim)');
      expect(result.recommendation).toContain('1.5 hari kerja');
    });
  });

  describe('findByProject', () => {
    it('should parse work hours as floats', async () => {
      (mockDb.query as jest.Mock).mockResolvedValue({
        rows: [
          {
            id: 'log-1',
            log_date: '2026-09-14',
            work_hours_effective: '7.5',
            work_hours_lost: '0.5',
          },
        ],
      });

      const res = await service.findByProject('proj-123');
      expect(res).toHaveLength(1);
      expect(res[0].work_hours_effective).toBe(7.5);
      expect(res[0].work_hours_lost).toBe(0.5);
    });
  });
});
