import { Controller, Get, Post, Param, Body, Headers, UseGuards, Request } from '@nestjs/common';
import { ActualsService } from './actuals.service';
import { AuthGuard } from '@nestjs/passport';
import { RolesGuard } from '../auth/roles.guard';
import { Roles } from '../auth/roles.decorator';
import { UserRole, ActualSource } from '@karsa/shared-types';

@Controller('rab-items')
@UseGuards(AuthGuard('jwt'), RolesGuard)
export class ActualsController {
  constructor(private readonly actualsService: ActualsService) {}

  @Get(':id/actuals')
  findByRabItem(@Param('id') rabItemId: string) {
    return this.actualsService.findByRabItem(rabItemId);
  }

  @Post(':id/actuals')
  @Roles(UserRole.SUPERVISOR, UserRole.PM, UserRole.ADMIN)
  create(
    @Param('id') rabItemId: string,
    @Headers('Idempotency-Key') idempotencyKeyHeader: string,
    @Body()
    body: {
      clientGeneratedId?: string;
      idempotencyKey?: string;
      entryDate: string;
      qty: number;
      actualUnitPrice: number;
      vendor: string;
      invoiceNumber?: string;
      description?: string;
      source?: ActualSource;
      attachmentUrls?: string[];
    },
    @Request() req: any,
  ) {
    const key = idempotencyKeyHeader || body.idempotencyKey;
    return this.actualsService.create(rabItemId, { ...body, idempotencyKey: key }, req.user.id);
  }
}
