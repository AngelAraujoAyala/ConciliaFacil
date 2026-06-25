import {
  Controller,
  Post,
  Get,
  Body,
  Param,
  Query,
  HttpCode,
  HttpStatus,
  ParseUUIDPipe,
  BadRequestException,
} from '@nestjs/common';
import { ReconciliationsService } from './reconciliations.service';
import { CreateConciliationDto } from './dto/create-conciliation.dto';

@Controller('reconciliations')
export class ReconciliationsController {
  constructor(
    private readonly reconciliationsService: ReconciliationsService,
  ) {}

  @Post()
  @HttpCode(HttpStatus.CREATED)
  create(@Body() createConciliationDto: CreateConciliationDto) {
    return this.reconciliationsService.createBulk(createConciliationDto);
  }

  @Get()
  findAll(@Query('userId', new ParseUUIDPipe()) userId: string) {
    if (!userId) {
      throw new BadRequestException(
        'El parámetro userId es requerido y debe ser un UUID válido.',
      );
    }
    return this.reconciliationsService.findAllByUser(userId);
  }

  @Get(':id')
  findOne(
    @Param('id', new ParseUUIDPipe()) id: string,
    @Query('userId', new ParseUUIDPipe()) userId: string,
  ) {
    return this.reconciliationsService.findOne(id, userId);
  }
}
