import { Injectable } from '@nestjs/common';
import { EvmMetrics } from '@karsa/shared-types';

@Injectable()
export class EvmCalculatorService {
  /**
   * Menghitung seluruh matriks Earned Value Management (EVM) secara deterministik:
   * - PV (Planned Value) = (plannedProgressPct / 100) * totalRab
   * - EV (Earned Value) = (actualProgressPct / 100) * totalRab
   * - AC (Actual Cost) = actualCost
   * - CV (Cost Variance) = EV - AC
   * - SV (Schedule Variance) = EV - PV
   * - CPI (Cost Performance Index) = EV / AC (bila AC == 0, fallback CPI = 1.0)
   * - SPI (Schedule Performance Index) = EV / PV (bila PV == 0, fallback SPI = 1.0)
   * - EAC (Estimate at Completion) = totalRab / CPI (bila CPI > 0)
   * - VAC (Variance at Completion) = totalRab - EAC
   */
  calculateEvm(
    totalRab: number,
    plannedProgressPct: number,
    actualProgressPct: number,
    actualCost: number,
  ): EvmMetrics {
    if (totalRab < 0 || plannedProgressPct < 0 || actualProgressPct < 0 || actualCost < 0) {
      throw new Error('Nilai masukan EVM tidak boleh bernilai negatif');
    }

    const plannedValue = Math.round(((plannedProgressPct / 100) * totalRab + Number.EPSILON) * 100) / 100;
    const earnedValue = Math.round(((actualProgressPct / 100) * totalRab + Number.EPSILON) * 100) / 100;
    const ac = Math.round((actualCost + Number.EPSILON) * 100) / 100;

    const costVariance = Math.round((earnedValue - ac + Number.EPSILON) * 100) / 100;
    const scheduleVariance = Math.round((earnedValue - plannedValue + Number.EPSILON) * 100) / 100;

    const cpi = ac > 0 ? Math.round((earnedValue / ac + Number.EPSILON) * 10000) / 10000 : 1.0;
    const spi = plannedValue > 0 ? Math.round((earnedValue / plannedValue + Number.EPSILON) * 10000) / 10000 : 1.0;

    let estimateAtCompletion = totalRab;
    if (cpi > 0) {
      estimateAtCompletion = Math.round((totalRab / cpi + Number.EPSILON) * 100) / 100;
    }

    const varianceAtCompletion = Math.round((totalRab - estimateAtCompletion + Number.EPSILON) * 100) / 100;

    return {
      totalRab,
      plannedValue,
      earnedValue,
      actualCost: ac,
      costVariance,
      scheduleVariance,
      cpi,
      spi,
      estimateAtCompletion,
      varianceAtCompletion,
    };
  }
}
