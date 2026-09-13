import { Injectable } from '@nestjs/common';

@Injectable()
export class RabCalculatorService {
  /**
   * Menghitung subtotal item pekerjaan: volume × harga satuan.
   * Dibulatkan ke 2 digit desimal untuk menghindari floating-point imprecision.
   */
  calculateSubtotal(volume: number, unitPrice: number): number {
    if (volume < 0 || unitPrice < 0) {
      throw new Error('Volume dan harga satuan tidak boleh bernilai negatif');
    }
    const subtotal = volume * unitPrice;
    return Math.round((subtotal + Number.EPSILON) * 100) / 100;
  }

  /**
   * Menghitung total RAB dari seluruh subtotal item pekerjaan.
   */
  calculateTotalRab(items: { volume: number; unitPrice: number; subtotal?: number }[]): number {
    if (!items || items.length === 0) {
      return 0;
    }
    const total = items.reduce((acc, item) => {
      const subtotal = item.subtotal !== undefined ? item.subtotal : this.calculateSubtotal(item.volume, item.unitPrice);
      return acc + subtotal;
    }, 0);
    return Math.round((total + Number.EPSILON) * 100) / 100;
  }

  /**
   * Menghitung bobot persentase (% weight) tiap item terhadap total RAB.
   * Total bobot seluruh item harus mencapai 100% bila dijumlahkan.
   */
  calculateWeights(items: { subtotal: number }[], totalRab: number): number[] {
    if (totalRab <= 0 || items.length === 0) {
      return items.map(() => 0);
    }
    return items.map((item) => {
      const weight = (item.subtotal / totalRab) * 100;
      return Math.round((weight + Number.EPSILON) * 1000) / 1000;
    });
  }
}
