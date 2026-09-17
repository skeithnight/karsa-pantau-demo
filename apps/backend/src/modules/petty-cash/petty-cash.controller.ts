import { Controller, Get, Post, Patch, Body, Param, Query, Req, UseGuards } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { RolesGuard } from '../auth/roles.guard';
import { Roles } from '../auth/roles.decorator';
import { UserRole } from '@karsa/shared-types';
import { PettyCashService, CreatePettyCashDto, SettlePettyCashDto } from './petty-cash.service';

@Controller('projects/:projectId/petty-cash')
@UseGuards(AuthGuard('jwt'), RolesGuard)
export class PettyCashController {
  constructor(private readonly pettyCashService: PettyCashService) {}

  @Get()
  async getTransactions(
    @Param('projectId') projectId: string,
    @Query('status') status?: string,
  ) {
    return this.pettyCashService.getTransactions(projectId, status);
  }

  @Get('summary')
  async getSummary(@Param('projectId') projectId: string) {
    return this.pettyCashService.getSummary(projectId);
  }

  @Post()
  @Roles(UserRole.SUPERVISOR, UserRole.PM, UserRole.ADMIN)
  async createRequest(
    @Param('projectId') projectId: string,
    @Body() body: CreatePettyCashDto,
    @Req() req: any,
  ) {
    const userId = req.user?.id || req.user?.sub;
    return this.pettyCashService.createRequest(projectId, body, userId);
  }

  @Patch(':id/approve')
  @Roles(UserRole.APPROVER, UserRole.PM, UserRole.ADMIN)
  async approveRequest(
    @Param('id') id: string,
    @Req() req: any,
  ) {
    const approverId = req.user?.id || req.user?.sub;
    return this.pettyCashService.approveRequest(id, approverId);
  }

  @Patch(':id/disburse')
  @Roles(UserRole.APPROVER, UserRole.ADMIN)
  async disburseRequest(@Param('id') id: string) {
    return this.pettyCashService.disburseRequest(id);
  }

  @Post(':id/settle')
  @Roles(UserRole.SUPERVISOR, UserRole.PM, UserRole.ADMIN)
  async settleRequest(
    @Param('id') id: string,
    @Body() body: SettlePettyCashDto,
  ) {
    return this.pettyCashService.settleRequest(id, body);
  }

  @Patch(':id/reject')
  @Roles(UserRole.APPROVER, UserRole.PM, UserRole.ADMIN)
  async rejectRequest(
    @Param('id') id: string,
    @Body() body: { reason?: string },
  ) {
    return this.pettyCashService.rejectRequest(id, body?.reason);
  }
}
