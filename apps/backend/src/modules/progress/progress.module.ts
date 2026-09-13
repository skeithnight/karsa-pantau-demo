import { Module } from '@nestjs/common';
import { ProgressService } from './progress.service';
import { ProgressController } from './progress.controller';
import { EvmCalculatorService } from './evm-calculator.service';

@Module({
  providers: [ProgressService, EvmCalculatorService],
  controllers: [ProgressController],
  exports: [ProgressService, EvmCalculatorService],
})
export class ProgressModule {}
