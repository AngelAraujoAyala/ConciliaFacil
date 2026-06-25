import { Controller, Post, Body, HttpCode, HttpStatus } from '@nestjs/common';
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
}
