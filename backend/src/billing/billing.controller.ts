import {
    Controller,
    Post,
    Get,
    Query,
    Body,
    UseGuards,
    Req,
    Headers,
    BadRequestException
} from '@nestjs/common';
import type { RawBodyRequest } from '@nestjs/common';
import type { Request } from 'express';
import { BillingService } from './billing.service';
import { BillingSubscriptionService } from './billing-subscription.service';
import { SupabaseAuthGuard } from '../auth/guards/supabase-auth.guard';

@Controller('billing')
export class BillingController {
    constructor(
        private readonly billingService: BillingService,
        private readonly billingSubscriptionService: BillingSubscriptionService,
    ) { }

    @Post('create-checkout-session')
    @UseGuards(SupabaseAuthGuard)
    async createCheckoutSession(
        @Body('priceId') priceId: string,
        @Req() req: any
    ) {
        const userId = req.user?.id;
        return this.billingService.createCheckoutSession(userId, priceId);
    }

    @Get('upgrade-preview')
    @UseGuards(SupabaseAuthGuard)
    async upgradePreview(
        @Query('priceId') priceId: string,
        @Req() req: any
    ) {
        const userId = req.user?.id;
        return this.billingSubscriptionService.previewUpgrade(userId, priceId);
    }

    @Post('change-plan')
    @UseGuards(SupabaseAuthGuard)
    async changePlan(
        @Body('priceId') priceId: string | null,
        @Req() req: any
    ) {
        const userId = req.user?.id;
        return this.billingSubscriptionService.processPlanChange(userId, priceId);
    }

    @Post('cancel-subscription')
    @UseGuards(SupabaseAuthGuard)
    async cancelSubscription(@Req() req: any) {
        const userId = req.user?.id;
        return this.billingSubscriptionService.cancelSubscription(userId);
    }

    @Post('webhook')
    async handleWebhook(
        @Req() req: RawBodyRequest<Request>,
        @Headers('stripe-signature') signature: string,
    ) {
        if (!signature) {
            throw new BadRequestException('Falta la firma de Stripe');
        }

        if (!req.rawBody) {
            throw new BadRequestException('No se pudo leer el cuerpo en bruto (rawBody)');
        }

        return this.billingService.handleWebhookEvent(req.rawBody, signature);
    }
}