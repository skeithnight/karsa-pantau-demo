import { Controller, Get, Post, Body, Param, Query, Req } from '@nestjs/common';
import { DailyLogsService, UpsertDailyLogDto } from './daily-logs.service';

@Controller('projects/:projectId/daily-logs')
export class DailyLogsController {
  constructor(private readonly dailyLogsService: DailyLogsService) {}

  @Get()
  async getDailyLogs(
    @Param('projectId') projectId: string,
    @Query('limit') limit?: string,
  ) {
    const limitNum = limit ? parseInt(limit, 10) : 30;
    return this.dailyLogsService.findByProject(projectId, limitNum);
  }

  @Get('eot-summary')
  async getEotSummary(@Param('projectId') projectId: string) {
    return this.dailyLogsService.calculateEotSummary(projectId);
  }

  @Get(':date')
  async getDailyLogByDate(
    @Param('projectId') projectId: string,
    @Param('date') date: string,
  ) {
    return this.dailyLogsService.findByDate(projectId, date);
  }

  @Post()
  async upsertDailyLog(
    @Param('projectId') projectId: string,
    @Body() body: UpsertDailyLogDto,
    @Req() req: any,
  ) {
    const userId = req.user?.id || req.user?.sub;
    return this.dailyLogsService.upsert(projectId, body, userId);
  }
}
