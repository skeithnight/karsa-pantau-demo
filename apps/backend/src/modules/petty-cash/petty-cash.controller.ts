import { Controller, Get, Post, Patch, Body, Param, Query, Req } from '@nestjs/common';
import { PettyCashService, CreatePettyCashDto, SettlePettyCashDto } from './petty-cash.service';

@Controller('api/v1/projects/:projectId/petty-cash')
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
  async createRequest(
    @Param('projectId') projectId: string,
    @Body() body: CreatePettyCashDto,
    @Req() req: any,
  ) {
    const userId = req.user?.id || req.user?.sub;
    return this.pettyCashService.createRequest(projectId, body, userId);
  }

  @Patch(':id/approve')
  async approveRequest(
    @Param('id') id: string,
    @Req() req: any,
  ) {
    const approverId = req.user?.id || req.user?.sub;
    return this.pettyCashService.approveRequest(id, approverId);
  }

  @Patch(':id/disburse')
  async disburseRequest(@Param('id') id: string) {
    return this.pettyCashService.disburseRequest(id);
  }

  @Post(':id/settle')
  async settleRequest(
    @Param('id') id: string,
    @Body() body: SettlePettyCashDto,
  ) {
    return this.pettyCashService.settleRequest(id, body);
  }

  @Patch(':id/reject')
  async rejectRequest(
    @Param('id') id: string,
    @Body() body: { reason?: string },
  ) {
    return this.pettyCashService.rejectRequest(id, body?.reason);
  }
}
