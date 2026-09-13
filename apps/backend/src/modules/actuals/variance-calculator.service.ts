import { Injectable } from '@nestjs/common';

@Injectable()
export class VarianceCalculatorService {
  /**
   * Menghitung total pengeluaran actual satu entri nota: qty × actual_unit_price.
   */
  calculateTotalActual(qty: number, actualUnitPrice: number): number {
    if (qty < 0 || actualUnitPrice < 0) {
      throw new Error('Qty dan harga aktual tidak boleh negatif');
    }
    const total = qty * actualUnitPrice;
    return Math.round((total + Number.EPSILON) * 100) / 100;
  }

  /**
   * Menghitung persentase selisih (variance):
   * formula: ((totalActual - budgetSubtotal) / budgetSubtotal) * 100
   * Positif (+) berarti overbudget, Negatif (-) berarti underbudget.
   */
  calculateVariancePct(budgetSubtotal: number, totalActual: number): number {
    if (budgetSubtotal <= 0) {
      return totalActual > 0 ? 100 : 0;
    }
    const variance = ((totalActual - budgetSubtotal) / budgetSubtotal) * 100;
    return Math.round((variance + Number.EPSILON) * 100) / 100;
  }

  /**
   * Mendeteksi apakah realisasi melebihi batas toleransi anggaran (overbudget).
   * @param thresholdPct ambang batas toleransi dalam persen (default: 0%, artinya setiap kelebihan adalah overbudget)
   */
  isOverbudget(budgetSubtotal: number, totalActual: number, thresholdPct = 0): boolean {
    const variance = this.calculateVariancePct(budgetSubtotal, totalActual);
    return variance > thresholdPct;
  }
}
