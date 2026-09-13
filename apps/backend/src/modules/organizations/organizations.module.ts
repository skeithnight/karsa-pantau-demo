import { Module } from '@nestjs/common';
import { OrganizationsService } from './organizations.service';
import { OrganizationsController } from './organizations.controller';
import { DatabaseModule } from '../../database/database.module';
import { SubscriptionsModule } from '../subscriptions/subscriptions.module';

@Module({
  imports: [DatabaseModule, SubscriptionsModule],
  controllers: [OrganizationsController],
  providers: [OrganizationsService],
  exports: [OrganizationsService],
})
export class OrganizationsModule {}
