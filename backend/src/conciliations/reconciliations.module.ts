import { Module } from '@nestjs/common';
import { ReconciliationsService } from './reconciliations.service';
import { ReconciliationsController } from './reconciliations.controller';
import { PrismaModule } from '../prisma/prisma.module'; // Ajusta según tu estructura

@Module({
  imports: [PrismaModule],
  controllers: [ReconciliationsController],
  providers: [ReconciliationsService],
  exports: [ReconciliationsService],
})
export class ConciliationsModule {}
