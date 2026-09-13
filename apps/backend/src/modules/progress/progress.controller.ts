import { Controller, Get, Post, Param, Body, UseGuards, Request } from '@nestjs/common';
import { ProgressService } from './progress.service';
import { AuthGuard } from '@nestjs/passport';
import { RolesGuard } from '../auth/roles.guard';
import { Roles } from '../auth/roles.decorator';
import { UserRole } from '@karsa/shared-types';

@Controller('projects')
@UseGuards(AuthGuard('jwt'), RolesGuard)
export class ProgressController {
  constructor(private readonly progressService: ProgressService) {}

  @Get(':id/progress')
  findByProject(@Param('id') projectId: string) {
    return this.progressService.findByProject(projectId);
  }

  @Post(':id/progress')
  @Roles(UserRole.PM, UserRole.SUPERVISOR, UserRole.ADMIN)
  logProgress(
    @Param('id') projectId: string,
    @Body()
    body: {
      periodWeek: number;
      logDate: string;
      plannedProgressPct: number;
      actualProgressPct: number;
      notes?: string;
    },
    @Request() req: any,
  ) {
    return this.progressService.logProgress(projectId, body, req.user.id);
  }
}
