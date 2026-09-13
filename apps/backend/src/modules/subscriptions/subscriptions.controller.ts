import { Controller, Get, Post, Body, Param, Headers, UseGuards, Query } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { SubscriptionsService } from './subscriptions.service';
import { RolesGuard } from '../auth/roles.guard';
import { Roles } from '../auth/roles.decorator';
import { UserRole, CheckoutPlanDto, ConfirmInvoiceDto } from '@karsa/shared-types';

@Controller('subscriptions')
export class SubscriptionsController {
  constructor(private readonly subscriptionsService: SubscriptionsService) {}

  /**
   * Katalog Paket Berlangganan (Public)
   */
  @Get('plans')
  async getPlans() {
    return this.subscriptionsService.getAllPlans();
  }

  /**
   * Detail Pemakaian Kuota & Status Berlangganan Organisasi
   */
  @Get('usage')
  @UseGuards(AuthGuard('jwt'))
  async getUsage(
    @Headers('x-organization-id') orgHeader?: string,
    @Query('organizationId') orgQuery?: string,
  ) {
    const orgId = orgHeader || orgQuery;
    if (!orgId) {
      throw new Error('Header X-Organization-Id atau parameter organizationId wajib disertakan.');
    }
    return this.subscriptionsService.getSubscriptionUsage(orgId);
  }

  /**
   * Checkout / Upgrade Paket
   */
  @Post('checkout')
  @UseGuards(AuthGuard('jwt'), RolesGuard)
  @Roles(UserRole.ADMIN, UserRole.PM)
  async checkout(
    @Body() dto: CheckoutPlanDto,
    @Headers('x-organization-id') orgHeader?: string,
    @Query('organizationId') orgQuery?: string,
  ) {
    const orgId = orgHeader || orgQuery;
    if (!orgId) {
      throw new Error('Header X-Organization-Id wajib disertakan.');
    }
    return this.subscriptionsService.checkoutPlan(orgId, dto);
  }

  /**
   * Daftar Faktur / Riwayat Tagihan
   */
  @Get('invoices')
  @UseGuards(AuthGuard('jwt'))
  async getInvoices(
    @Headers('x-organization-id') orgHeader?: string,
    @Query('organizationId') orgQuery?: string,
  ) {
    const orgId = orgHeader || orgQuery;
    if (!orgId) {
      throw new Error('Header X-Organization-Id wajib disertakan.');
    }
    return this.subscriptionsService.getInvoices(orgId);
  }

  /**
   * Konfirmasi Pembayaran Faktur (Simulasi / Upload Bukti Transfer)
   */
  @Post('invoices/:id/confirm')
  @UseGuards(AuthGuard('jwt'))
  async confirmInvoice(
    @Param('id') invoiceId: string,
    @Body() body: ConfirmInvoiceDto,
  ) {
    return this.subscriptionsService.confirmInvoicePayment(invoiceId, body.paymentProofUrl);
  }
}
