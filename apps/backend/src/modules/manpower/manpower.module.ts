import { Module } from '@nestjs/common';
import { ManpowerService } from './manpower.service';
import { ManpowerController } from './manpower.controller';

@Module({
  providers: [ManpowerService],
  controllers: [ManpowerController],
  exports: [ManpowerService],
})
export class ManpowerModule {}
