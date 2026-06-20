import { Controller, Get, Post, Body, Param, UseGuards } from '@nestjs/common';
import { ConciliationsService } from './conciliations.service';
import { SaveConciliationDto } from './dto/save-conciliation.dto';
import { SupabaseAuthGuard } from '../auth/supabase.guard';
import { GetUser } from '../auth/get-user.decorator';

@Controller('conciliations')
@UseGuards(SupabaseAuthGuard) // 🔒 Blindaje total: nadie entra sin su JWT de Supabase
export class ConciliationsController {
  constructor(private readonly conciliationsService: ConciliationsService) {}

  /**
   * 💾 POST /conciliations
   * Guarda o actualiza un borrador/conciliación del store de Zustand
   */
  @Post()
  async save(
    @GetUser() user: { userId: string; email: string },
    @Body() saveConciliationDto: SaveConciliationDto,
  ) {
    // El userId viene seguro desde el token, el cliente no lo puede falsificar
    return this.conciliationsService.save(user.userId, saveConciliationDto);
  }

  /**
   * 📊 GET /conciliations
   * Obtiene el historial resumido y optimizado del contador
   */
  @Get()
  async findAll(@GetUser() user: { userId: string }) {
    return this.conciliationsService.findAllByUser(user.userId);
  }

  /**
   * 🔍 GET /conciliations/:id
   * Recupera los JSONs pesados de una conciliación específica para rehidratar el frontend
   */
  @Param('id')
  async findOne(@Param('id') id: string, @GetUser() user: { userId: string }) {
    return this.conciliationsService.findOne(id, user.userId);
  }
}
