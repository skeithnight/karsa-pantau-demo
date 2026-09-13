import { AiForecastService } from '../services/ai-forecast.service';

describe('AiForecastService', () => {
  let service: AiForecastService;
  let mockDb: any;
  let mockNineRouter: any;

  beforeEach(() => {
    mockDb = {
      query: jest.fn(),
    };
    mockNineRouter = {
      createChatCompletion: jest.fn(),
    };
    service = new AiForecastService(mockDb, mockNineRouter);
  });

  it('menghitung metrik EVM secara deterministik di backend', async () => {
    // Proyek RAB 1 Miliar
    mockDb.query
      .mockResolvedValueOnce({
        rows: [{ id: 'proj-1', name: 'PLTS Test', total_rab: '1000000000', organization_id: null }],
      })
      // Progres Rencana 50%, Progres Aktual 40%
      .mockResolvedValueOnce({
        rows: [{ planned_progress_pct: 50, actual_progress_pct: 40 }],
      })
      // Actual Cost (AC) = 450 Juta
      .mockResolvedValueOnce({
        rows: [{ total_actual: '450000000' }],
      })
      // Insert audit insight
      .mockResolvedValueOnce({
        rows: [{ id: 'insight-123' }],
      });

    mockNineRouter.createChatCompletion.mockResolvedValueOnce({
      content: 'Proyek mengalami sedikit cost overrun dan keterlambatan progres.',
      tokensUsed: 85,
      model: 'claude-3-5-sonnet',
      latencyMs: 120,
    });

    const result = await service.generateForecast('proj-1');

    expect(result.projectName).toBe('PLTS Test');
    // PV = 50% * 1M = 500M
    expect(result.metrics.pv).toBe(500000000);
    // EV = 40% * 1M = 400M
    expect(result.metrics.ev).toBe(400000000);
    // AC = 450M
    expect(result.metrics.ac).toBe(450000000);
    // CPI = 400M / 450M = 0.889
    expect(result.metrics.cpi).toBeCloseTo(0.889, 2);
    // SPI = 400M / 500M = 0.8
    expect(result.metrics.spi).toBeCloseTo(0.8, 2);
    // EAC = 1M / 0.889 = ~1.125M
    expect(result.metrics.eac).toBeGreaterThan(1000000000);

    expect(result.isAiGenerated).toBe(true);
    expect(result.narrativeForecast).toContain('cost overrun');
    expect(mockDb.query).toHaveBeenCalledWith(
      expect.stringContaining('INSERT INTO ai_insights'),
      expect.any(Array),
    );
  });

  it('menggunakan fallback berbasis aturan jika 9Router gagal merespons', async () => {
    mockDb.query
      .mockResolvedValueOnce({
        rows: [{ id: 'proj-1', name: 'PLTS Test', total_rab: '1000000000', organization_id: null }],
      })
      .mockResolvedValueOnce({
        rows: [{ planned_progress_pct: 50, actual_progress_pct: 50 }],
      })
      .mockResolvedValueOnce({
        rows: [{ total_actual: '500000000' }],
      })
      .mockResolvedValueOnce({
        rows: [{ id: 'insight-fallback' }],
      });

    mockNineRouter.createChatCompletion.mockRejectedValueOnce(new Error('Connection timeout'));

    const result = await service.generateForecast('proj-1');

    expect(result.metrics.cpi).toBe(1.0);
    expect(result.isAiGenerated).toBe(false);
    expect(result.narrativeForecast).toContain('PLTS Test');
    expect(result.narrativeForecast).toContain('CPI 1');
  });
});
