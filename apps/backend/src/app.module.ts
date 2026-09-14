import { Module } from '@nestjs/common';
import { DatabaseModule } from './database/database.module';
import { HealthModule } from './modules/health/health.module';
import { AuthModule } from './modules/auth/auth.module';
import { ProjectsModule } from './modules/projects/projects.module';
import { RabModule } from './modules/rab/rab.module';
import { ActualsModule } from './modules/actuals/actuals.module';
import { ProgressModule } from './modules/progress/progress.module';
import { ManpowerModule } from './modules/manpower/manpower.module';
import { SubscriptionsModule } from './modules/subscriptions/subscriptions.module';
import { OrganizationsModule } from './modules/organizations/organizations.module';
import { AiModule } from './modules/ai/ai.module';
import { DailyLogsModule } from './modules/daily-logs/daily-logs.module';
import { PettyCashModule } from './modules/petty-cash/petty-cash.module';

@Module({
  imports: [
    DatabaseModule,
    HealthModule,
    AuthModule,
    OrganizationsModule,
    SubscriptionsModule,
    ProjectsModule,
    RabModule,
    ActualsModule,
    ProgressModule,
    ManpowerModule,
    DailyLogsModule,
    PettyCashModule,
    AiModule,
  ],
})
export class AppModule {}
