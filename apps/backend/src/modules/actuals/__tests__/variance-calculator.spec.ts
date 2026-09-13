import { VarianceCalculatorService } from '../variance-calculator.service';

describe('VarianceCalculatorService', () => {
  let service: VarianceCalculatorService;

  beforeEach(() => {
    service = new VarianceCalculatorService();
  });

  describe('calculateTotalActual', () => {
    it('harus menghitung total realisasi pembelian dengan tepat', () => {
      expect(service.calculateTotalActual(10, 150000)).toBe(1500000);
    });

    it('harus melempar error jika qty atau harga satuan negatif', () => {
      expect(() => service.calculateTotalActual(-1, 100)).toThrow();
      expect(() => service.calculateTotalActual(1, -100)).toThrow();
    });
  });

  describe('calculateVariancePct', () => {
    it('harus menghitung variansi positif (+) saat overbudget', () => {
      // Budget: 1,000,000 | Actual: 1,200,000 -> +20%
      expect(service.calculateVariancePct(1000000, 1200000)).toBe(20);
    });

    it('harus menghitung variansi negatif (-) saat underbudget', () => {
      // Budget: 1,000,000 | Actual: 850,000 -> -15%
      expect(service.calculateVariancePct(1000000, 850000)).toBe(-15);
    });

    it('harus mengembalikan 0% jika realisasi sama persis dengan anggaran', () => {
      expect(service.calculateVariancePct(500000, 500000)).toBe(0);
    });

    it('harus menangani budget 0 dengan aman', () => {
      expect(service.calculateVariancePct(0, 50000)).toBe(100);
      expect(service.calculateVariancePct(0, 0)).toBe(0);
    });
  });

  describe('isOverbudget', () => {
    it('harus mendeteksi kondisi overbudget di atas threshold 0%', () => {
      expect(service.isOverbudget(1000, 1050)).toBe(true);
      expect(service.isOverbudget(1000, 950)).toBe(false);
    });

    it('harus menghormati ambang batas toleransi custom (mis. 10%)', () => {
      // Actual 1080 -> 8% overbudget -> tidak melebihi threshold 10%
      expect(service.isOverbudget(1000, 1080, 10)).toBe(false);
      // Actual 1150 -> 15% overbudget -> melebihi threshold 10%
      expect(service.isOverbudget(1000, 1150, 10)).toBe(true);
    });
  });
});
