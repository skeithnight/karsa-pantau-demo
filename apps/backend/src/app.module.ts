import { Module } from '@nestjs/common';
import { DatabaseModule } from './database/database.module';
import { HealthModule } from './modules/health/health.module';
import { AuthModule } from './modules/auth/auth.module';
import { ProjectsModule } from './modules/projects/projects.module';
import { RabModule } from './modules/rab/rab.module';
import { ActualsModule } from './modules/actuals/actuals.module';
import { ProgressModule } from './modules/progress/progress.module';
import { ManpowerModule } from './modules/manpower/manpower.module';

@Module({
  imports: [
    DatabaseModule,
    HealthModule,
    AuthModule,
    ProjectsModule,
    RabModule,
    ActualsModule,
    ProgressModule,
    ManpowerModule,
  ],
})
export class AppModule {}
