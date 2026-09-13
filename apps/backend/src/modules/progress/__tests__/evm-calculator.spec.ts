import { EvmCalculatorService } from '../evm-calculator.service';

describe('EvmCalculatorService', () => {
  let service: EvmCalculatorService;

  beforeEach(() => {
    service = new EvmCalculatorService();
  });

  describe('calculateEvm', () => {
    it('harus menghitung metrik EVM standar secara presisi', () => {
      // Total RAB: 1,000,000,000 (1 Miliar)
      // Planned Progress: 50% -> PV = 500,000,000
      // Actual Progress: 40% -> EV = 400,000,000
      // Actual Cost (AC): 450,000,000
      const metrics = service.calculateEvm(1000000000, 50, 40, 450000000);

      expect(metrics.plannedValue).toBe(500000000);
      expect(metrics.earnedValue).toBe(400000000);
      expect(metrics.actualCost).toBe(450000000);

      // Cost Variance (CV) = EV - AC = 400M - 450M = -50M (Cost Overrun)
      expect(metrics.costVariance).toBe(-50000000);

      // Schedule Variance (SV) = EV - PV = 400M - 500M = -100M (Behind Schedule)
      expect(metrics.scheduleVariance).toBe(-100000000);

      // CPI = EV / AC = 400M / 450M = 0.8889
      expect(metrics.cpi).toBe(0.8889);

      // SPI = EV / PV = 400M / 500M = 0.8000
      expect(metrics.spi).toBe(0.8);

      // EAC = BAC / CPI = 1Miliar / 0.8889 = 1,124,985,937.68
      expect(metrics.estimateAtCompletion).toBeCloseTo(1124985937.68, -2);

      // VAC = BAC - EAC = negatif (proyek diproyeksikan overbudget)
      expect(metrics.varianceAtCompletion).toBeLessThan(0);
    });

    it('harus menangani kasus awal proyek di mana belum ada realisasi (AC = 0)', () => {
      const metrics = service.calculateEvm(1000000000, 10, 0, 0);
      expect(metrics.plannedValue).toBe(100000000);
      expect(metrics.earnedValue).toBe(0);
      expect(metrics.actualCost).toBe(0);
      expect(metrics.cpi).toBe(1.0); // Fallback aman
      expect(metrics.estimateAtCompletion).toBe(1000000000);
    });

    it('harus menangani kasus di mana planned progress adalah 0 (PV = 0)', () => {
      const metrics = service.calculateEvm(1000000000, 0, 0, 0);
      expect(metrics.plannedValue).toBe(0);
      expect(metrics.spi).toBe(1.0); // Fallback aman
    });

    it('harus melempar error bila ada parameter bernilai negatif', () => {
      expect(() => service.calculateEvm(-100, 10, 10, 100)).toThrow();
      expect(() => service.calculateEvm(100, -10, 10, 100)).toThrow();
      expect(() => service.calculateEvm(100, 10, -10, 100)).toThrow();
      expect(() => service.calculateEvm(100, 10, 10, -100)).toThrow();
    });
  });
});
