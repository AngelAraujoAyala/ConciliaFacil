import { Module } from '@nestjs/common';
import { ConciliationsController } from './conciliations.controller';
import { ConciliationsService } from './conciliations.service';

@Module({
  controllers: [ConciliationsController],
  providers: [ConciliationsService]
})
export class ConciliationsModule {}
