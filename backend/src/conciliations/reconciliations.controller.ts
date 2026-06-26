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
import { SupabaseAuthGuard } from '../auth/guards/supabase-auth.guard';
import { CurrentUser } from '../auth/decorators/current-user.decorator';

@Controller('reconciliations')
@UseGuards(SupabaseAuthGuard)
export class ReconciliationsController {
  constructor(
    private readonly reconciliationsService: ReconciliationsService,
  ) {}

  @Post()
  @HttpCode(HttpStatus.CREATED)
  create(
    @Body() createConciliationDto: CreateConciliationDto,
    @CurrentUser() user: any,
  ) {
    if (createConciliationDto.userId !== user.id) {
      throw new ForbiddenException(
        'No tienes permiso para guardar una conciliación para otro usuario.',
      );
    }
    return this.reconciliationsService.createBulk(createConciliationDto, user.email);
  }

  @Patch(':id')
  @HttpCode(HttpStatus.OK)
  update(
    @Param('id', new ParseUUIDPipe()) id: string,
    @Body() createConciliationDto: CreateConciliationDto,
    @CurrentUser() user: any,
  ) {
    if (createConciliationDto.userId !== user.id) {
      throw new ForbiddenException(
        'No tienes permiso para modificar una conciliación de otro usuario.',
      );
    }
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
}
