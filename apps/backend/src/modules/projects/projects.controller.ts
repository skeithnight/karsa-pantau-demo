import { Controller, Get, Post, Patch, Param, Body, Query, UseGuards, Request, Headers } from '@nestjs/common';
import { ProjectsService } from './projects.service';
import { AuthGuard } from '@nestjs/passport';
import { RolesGuard } from '../auth/roles.guard';
import { Roles } from '../auth/roles.decorator';
import { UserRole, ProjectStatus } from '@karsa/shared-types';

@Controller('projects')
@UseGuards(AuthGuard('jwt'), RolesGuard)
export class ProjectsController {
  constructor(private readonly projectsService: ProjectsService) {}

  @Get()
  findAll(
    @Query('page') page?: string,
    @Query('limit') limit?: string,
    @Query('status') status?: string,
    @Headers('x-organization-id') orgHeader?: string,
    @Query('organizationId') orgQuery?: string,
  ) {
    const orgId = orgHeader || orgQuery;
    return this.projectsService.findAll(
      page ? parseInt(page, 10) : 1,
      limit ? parseInt(limit, 10) : 20,
      status,
      orgId,
    );
  }

  @Get(':id')
  findOne(
    @Param('id') id: string,
    @Headers('x-organization-id') orgHeader?: string,
    @Query('organizationId') orgQuery?: string,
  ) {
    const orgId = orgHeader || orgQuery;
    return this.projectsService.findOne(id, orgId);
  }

  @Post()
  @Roles(UserRole.ADMIN, UserRole.PM)
  create(
    @Body() body: { name: string; location: string; capacityMw: number; targetCodDate?: string },
    @Request() req: any,
    @Headers('x-organization-id') orgHeader?: string,
    @Query('organizationId') orgQuery?: string,
  ) {
    const orgId = orgHeader || orgQuery;
    return this.projectsService.create(body, req.user.id, orgId);
  }

  @Patch(':id')
  @Roles(UserRole.ADMIN, UserRole.PM)
  update(
    @Param('id') id: string,
    @Body() body: Partial<{ name: string; location: string; capacityMw: number; status: ProjectStatus }>,
  ) {
    return this.projectsService.update(id, body);
  }
}
