import { Module } from '@nestjs/common';
import { ActualsService } from './actuals.service';
import { ActualsController } from './actuals.controller';
import { VarianceCalculatorService } from './variance-calculator.service';

@Module({
  providers: [ActualsService, VarianceCalculatorService],
  controllers: [ActualsController],
  exports: [ActualsService, VarianceCalculatorService],
})
export class ActualsModule {}
