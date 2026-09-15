import { Controller, Get, Post, Delete, Body, Param, UseGuards, Request } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { OrganizationsService } from './organizations.service';
import { CreateOrganizationDto, InviteMemberDto } from '@karsa/shared-types';

@Controller('organizations')
@UseGuards(AuthGuard('jwt'))
export class OrganizationsController {
  constructor(private readonly organizationsService: OrganizationsService) {}

  /**
   * Membuat organisasi (tenant) baru
   */
  @Post()
  async create(@Request() req: any, @Body() dto: CreateOrganizationDto) {
    return this.organizationsService.createOrganization(req.user.id, dto);
  }

  /**
   * Mengambil daftar organisasi milik user saat ini
   */
  @Get('my')
  async getMyOrganizations(@Request() req: any) {
    return this.organizationsService.getUserOrganizations(req.user.id);
  }

  /**
   * Detail satu organisasi
   */
  @Get(':id')
  async getById(@Request() req: any, @Param('id') id: string) {
    return this.organizationsService.getOrganizationById(id, req.user.id);
  }

  /**
   * Daftar anggota tim organisasi
   */
  @Get(':id/members')
  async getMembers(@Request() req: any, @Param('id') id: string) {
    return this.organizationsService.getMembers(id, req.user.id);
  }

  /**
   * Mengundang anggota tim baru ke organisasi
   */
  @Post(':id/members')
  async inviteMember(
    @Request() req: any,
    @Param('id') id: string,
    @Body() dto: InviteMemberDto,
  ) {
    return this.organizationsService.inviteMember(id, req.user.id, dto);
  }

  /**
   * Menghapus atau menonaktifkan anggota tim dari organisasi
   */
  @Delete(':id/members/:memberId')
  async removeMember(
    @Request() req: any,
    @Param('id') id: string,
    @Param('memberId') memberId: string,
  ) {
    return this.organizationsService.removeMember(id, req.user.id, memberId);
  }
}
