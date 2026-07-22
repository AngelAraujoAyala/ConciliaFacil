import { Controller, Post, Body, UseGuards } from '@nestjs/common';
import { SupabaseAuthGuard } from '../auth/guards/supabase-auth.guard';
import { GetUser } from '../auth/decorators/get-user.decorator';
import { SupportService } from './support.service';
import { CreateSupportTicketDto } from './dto/create-support-ticket.dto';

@Controller('support')
@UseGuards(SupabaseAuthGuard)
export class SupportController {
  constructor(private readonly supportService: SupportService) {}

  @Post('contact')
  async contactSupport(
    @GetUser('email') email: string,
    @Body() dto: CreateSupportTicketDto,
  ) {
    await this.supportService.sendSupportEmail(email, dto.subject, dto.message);
    return { success: true, message: 'Mensaje enviado correctamente' };
  }
}
