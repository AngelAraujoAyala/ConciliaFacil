import {
    Controller,
    Post,
    Body,
    UseGuards,
    Req,
    Headers,
    BadRequestException
} from '@nestjs/common';
import type { RawBodyRequest } from '@nestjs/common'; // Importación como tipo para isolatedModules
import type { Request } from 'express'; // Importación como tipo para isolatedModules
import { BillingService } from './billing.service';
import { SupabaseAuthGuard } from '../auth/guards/supabase-auth.guard';

@Controller('billing')
export class BillingController {
    constructor(private readonly billingService: BillingService) { }

    @Post('create-checkout-session')
    @UseGuards(SupabaseAuthGuard)
    async createCheckoutSession(
        @Body('priceId') priceId: string,
        @Req() req: any
    ) {
        const userId = req.user?.id;
        return this.billingService.createCheckoutSession(userId, priceId);
    }

    @Post('webhook')
    async handleWebhook(
        // Al usar 'import type', TypeScript ya no se queja en el decorador
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