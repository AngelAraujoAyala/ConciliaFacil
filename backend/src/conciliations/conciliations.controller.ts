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
    @GetUser() user: { id: string; email: string },
    @Body() saveConciliationDto: SaveConciliationDto,
  ) {
    // El userId viene seguro desde el token, el cliente no lo puede falsificar
    return this.conciliationsService.save(user.id, saveConciliationDto);
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
  @Get(':id') // 👈 1. Te faltaba definir el método HTTP y el parámetro en la ruta
  async findOne(
    @Param('id') id: string, // 👈 2. El @Param('id') que estaba arriba, va solo aquí adentro
    @GetUser() user: { userId: string },
  ) {
    return this.conciliationsService.findOne(id, user.userId);
  }
}
