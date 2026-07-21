import { Module } from '@nestjs/common';
import { BillingController } from './billing.controller';
import { BillingService } from './billing.service';
import { BillingSubscriptionService } from './billing-subscription.service';

@Module({
  controllers: [BillingController],
  providers: [BillingService, BillingSubscriptionService]
})
export class BillingModule {}
