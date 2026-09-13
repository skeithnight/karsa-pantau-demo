import { Controller, Get, Post, Param, Body, UseGuards, Request } from '@nestjs/common';
import { ManpowerService } from './manpower.service';
import { AuthGuard } from '@nestjs/passport';
import { RolesGuard } from '../auth/roles.guard';
import { Roles } from '../auth/roles.decorator';
import { UserRole } from '@karsa/shared-types';

@Controller('projects')
@UseGuards(AuthGuard('jwt'), RolesGuard)
export class ManpowerController {
  constructor(private readonly manpowerService: ManpowerService) {}

  @Get(':id/manpower')
  findByProject(@Param('id') projectId: string) {
    return this.manpowerService.findByProject(projectId);
  }

  @Post(':id/manpower')
  @Roles(UserRole.SUPERVISOR, UserRole.PM, UserRole.ADMIN)
  create(
    @Param('id') projectId: string,
    @Body()
    body: {
      teamName: string;
      rabItemId?: string | null;
      plannedHeadcount: number;
      actualHeadcount: number;
      outputUnitInstalled?: number;
      logDate: string;
    },
    @Request() req: any,
  ) {
    return this.manpowerService.create(projectId, body, req.user.id);
  }
}
