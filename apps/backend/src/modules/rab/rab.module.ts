import { Module } from '@nestjs/common';
import { RabService } from './rab.service';
import { RabController } from './rab.controller';
import { RabCalculatorService } from './rab-calculator.service';

@Module({
  providers: [RabService, RabCalculatorService],
  controllers: [RabController],
  exports: [RabService, RabCalculatorService],
})
export class RabModule {}
