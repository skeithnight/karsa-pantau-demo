import { RabCalculatorService } from '../rab-calculator.service';

describe('RabCalculatorService', () => {
  let service: RabCalculatorService;

  beforeEach(() => {
    service = new RabCalculatorService();
  });

  describe('calculateSubtotal', () => {
    it('harus mengalikan volume dan unitPrice dengan presisi 2 desimal', () => {
      const result = service.calculateSubtotal(500, 2850000);
      expect(result).toBe(1425000000);
    });

    it('harus menangani desimal pecahan tanpa floating-point drift', () => {
      const result = service.calculateSubtotal(33.3333, 14500.5);
      expect(result).toBe(483349.52);
    });

    it('harus melempar error bila volume atau harga satuan bernilai negatif', () => {
      expect(() => service.calculateSubtotal(-10, 1000)).toThrow();
      expect(() => service.calculateSubtotal(10, -1000)).toThrow();
    });

    it('harus mengembalikan 0 jika volume atau harga bernilai 0', () => {
      expect(service.calculateSubtotal(0, 1000)).toBe(0);
      expect(service.calculateSubtotal(10, 0)).toBe(0);
    });
  });

  describe('calculateTotalRab', () => {
    it('harus menjumlahkan subtotal seluruh item dengan tepat', () => {
      const items = [
        { volume: 100, unitPrice: 2000 },   // 200,000
        { volume: 50, unitPrice: 3000 },    // 150,000
        { volume: 10, unitPrice: 15000 },   // 150,000
      ];
      expect(service.calculateTotalRab(items)).toBe(500000);
    });

    it('harus memakai subtotal langsung bila sudah tersedia', () => {
      const items = [
        { volume: 10, unitPrice: 100, subtotal: 1000 },
        { volume: 5, unitPrice: 200, subtotal: 1000 },
      ];
      expect(service.calculateTotalRab(items)).toBe(2000);
    });

    it('harus mengembalikan 0 jika daftar item kosong', () => {
      expect(service.calculateTotalRab([])).toBe(0);
    });
  });

  describe('calculateWeights', () => {
    it('harus menghitung proporsi bobot item terhadap total RAB', () => {
      const items = [
        { subtotal: 250000 },
        { subtotal: 250000 },
        { subtotal: 500000 },
      ];
      const totalRab = 1000000;
      const weights = service.calculateWeights(items, totalRab);
      expect(weights).toEqual([25, 25, 50]);
      expect(weights.reduce((a, b) => a + b, 0)).toBe(100);
    });

    it('harus mengembalikan bobot 0 bila total RAB adalah 0', () => {
      const items = [{ subtotal: 100 }];
      expect(service.calculateWeights(items, 0)).toEqual([0]);
    });
  });
});
