import { Controller, Get, HttpStatus, Res } from '@nestjs/common';
import { Response } from 'express';
import { DatabaseService } from '../../database/database.service';

@Controller('health')
export class HealthController {
  constructor(private readonly db: DatabaseService) {}

  @Get('liveness')
  getLiveness(@Res() res: Response) {
    return res.status(HttpStatus.OK).json({
      status: 'ok',
      uptime: process.uptime(),
      timestamp: new Date().toISOString(),
    });
  }

  @Get('readiness')
  async getReadiness(@Res() res: Response) {
    const isDbConnected = await this.db.isHealthy();

    if (!isDbConnected) {
      return res.status(HttpStatus.SERVICE_UNAVAILABLE).json({
        status: 'degraded',
        database: 'disconnected',
        timestamp: new Date().toISOString(),
      });
    }

    return res.status(HttpStatus.OK).json({
      status: 'ok',
      database: 'connected',
      timestamp: new Date().toISOString(),
    });
  }
}
