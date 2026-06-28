import { Module } from '@nestjs/common';
import { PrismaService } from '../common/prisma.service';
import { ExcellenceController } from './excellence.controller';
import { ExcellenceService } from './excellence.service';

@Module({
  controllers: [ExcellenceController],
  providers: [PrismaService, ExcellenceService],
  exports: [ExcellenceService],
})
export class ExcellenceModule {}
