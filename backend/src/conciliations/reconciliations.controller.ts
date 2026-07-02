import {
  Controller,
  Post,
  Patch,
  Get,
  Body,
  Param,
  Query,
  HttpCode,
  HttpStatus,
  ParseUUIDPipe,
  ForbiddenException,
  UseGuards,
} from '@nestjs/common';
import { ReconciliationsService } from './reconciliations.service';
import { CreateConciliationDto } from './dto/create-conciliation.dto';
import { ClassifyMovementDto } from './dto/classify-movement.dto';
import { SupabaseAuthGuard } from '../auth/guards/supabase-auth.guard';
import { CurrentUser } from '../auth/decorators/current-user.decorator';

@Controller('reconciliations')
@UseGuards(SupabaseAuthGuard)
export class ReconciliationsController {
  constructor(
    private readonly reconciliationsService: ReconciliationsService,
  ) { }

  @Post()
  @HttpCode(HttpStatus.CREATED)
  create(
    @Body() createConciliationDto: CreateConciliationDto,
    @CurrentUser() user: any,
  ) {
    // Si el cliente envía un userId diferente, lo bloqueamos de inmediato
    if (createConciliationDto.userId && createConciliationDto.userId !== user.id) {
      throw new ForbiddenException(
        'No tienes permiso para guardar una conciliación para otro usuario.',
      );
    }

    // 💡 ROBUSTEZ: Aseguramos que el DTO lleve el ID verificado del token 
    // antes de pasarlo al Service, por si el frontend no lo envió en el JSON body.
    createConciliationDto.userId = user.id;

    return this.reconciliationsService.createBulk(createConciliationDto, user.email);
  }

  @Patch(':id')
  @HttpCode(HttpStatus.OK)
  update(
    @Param('id', new ParseUUIDPipe()) id: string,
    @Body() createConciliationDto: CreateConciliationDto,
    @CurrentUser() user: any,
  ) {
    if (createConciliationDto.userId && createConciliationDto.userId !== user.id) {
      throw new ForbiddenException(
        'No tienes permiso para modificar una conciliación de otro usuario.',
      );
    }

    // 💡 ROBUSTEZ: Aseguramos la mutación blindada con el ID del token
    createConciliationDto.userId = user.id;

    return this.reconciliationsService.updateOne(
      id,
      createConciliationDto,
      user.email,
    );
  }

  @Get()
  findAll(
    @Query('userId', new ParseUUIDPipe()) userId: string,
    @CurrentUser() user: any,
  ) {
    if (userId !== user.id) {
      throw new ForbiddenException(
        'No tienes permiso para acceder al historial de conciliaciones de otro usuario.',
      );
    }
    return this.reconciliationsService.findAllByUser(userId);
  }

  @Get(':id')
  findOne(
    @Param('id', new ParseUUIDPipe()) id: string,
    @Query('userId', new ParseUUIDPipe()) userId: string,
    @CurrentUser() user: any,
  ) {
    if (userId !== user.id) {
      throw new ForbiddenException(
        'No tienes permiso para acceder al detalle de esta conciliación.',
      );
    }
    return this.reconciliationsService.findOne(id, userId);
  }

  @Patch(':id/movements/:movementId/classify')
  @HttpCode(HttpStatus.OK)
  classifyMovement(
    @Param('id', new ParseUUIDPipe()) id: string,
    @Param('movementId') movementId: string,
    @Body() dto: ClassifyMovementDto,
    @CurrentUser() user: any,
  ) {
    return this.reconciliationsService.classifyMovementManual(
      id,
      movementId,
      dto,
      user.id,
    );
  }
}