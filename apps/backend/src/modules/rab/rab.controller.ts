import { Controller, Get, Post, Delete, Param, Body, UseGuards, Request, Headers, Query } from '@nestjs/common';
import { RabService } from './rab.service';
import { AuthGuard } from '@nestjs/passport';
import { RolesGuard } from '../auth/roles.guard';
import { Roles } from '../auth/roles.decorator';
import { UserRole, BaselineType, WorkPackage, CostCategory } from '@karsa/shared-types';

@Controller()
@UseGuards(AuthGuard('jwt'), RolesGuard)
export class RabController {
  constructor(private readonly rabService: RabService) {}

  @Get('projects/:id/rab')
  findByProject(@Param('id') projectId: string) {
    return this.rabService.findByProject(projectId);
  }

  @Get('projects/:id/rab/active')
  findActiveByProject(@Param('id') projectId: string) {
    return this.rabService.findActiveByProject(projectId);
  }

  @Get('rab/pending-approvals')
  @Roles(UserRole.APPROVER, UserRole.ADMIN)
  findPendingApprovals(
    @Headers('x-organization-id') orgHeader?: string,
    @Query('organizationId') orgQuery?: string,
  ) {
    const orgId = orgHeader || orgQuery;
    return this.rabService.findPendingApprovals(orgId);
  }

  @Post('projects/:id/rab')
  @Roles(UserRole.ESTIMATOR, UserRole.PM, UserRole.ADMIN)
  create(
    @Param('id') projectId: string,
    @Body() body: { baselineType?: BaselineType; notes?: string },
  ) {
    return this.rabService.create(projectId, body.baselineType, body.notes);
  }

  @Post('rab/:id/items')
  @Roles(UserRole.ESTIMATOR, UserRole.ADMIN)
  addItem(
    @Param('id') rabId: string,
    @Body()
    body: {
      parentId?: string | null;
      wbsCode: string;
      itemCode: string;
      workPackage: WorkPackage;
      category: CostCategory;
      description: string;
      volume: number;
      unit: string;
      unitPrice: number;
    },
  ) {
    return this.rabService.addItem(rabId, body);
  }

  @Delete('rab/:id/items/:itemId')
  @Roles(UserRole.ESTIMATOR, UserRole.ADMIN)
  deleteItem(@Param('id') rabId: string, @Param('itemId') itemId: string) {
    return this.rabService.deleteItem(rabId, itemId);
  }

  @Post('rab/:id/submit')
  @Roles(UserRole.ESTIMATOR, UserRole.ADMIN)
  submit(@Param('id') rabId: string) {
    return this.rabService.submit(rabId);
  }

  @Post('rab/:id/approve')
  @Roles(UserRole.APPROVER, UserRole.ADMIN)
  approve(@Param('id') rabId: string, @Request() req: any) {
    return this.rabService.approve(rabId, req.user.id);
  }

  @Post('rab/:id/reject')
  @Roles(UserRole.APPROVER, UserRole.ADMIN)
  reject(@Param('id') rabId: string, @Body() body: { note: string }) {
    return this.rabService.reject(rabId, body.note);
  }
}
