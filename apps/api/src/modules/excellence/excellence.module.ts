import { Module } from '@nestjs/common';
import { PrismaService } from '../common/prisma.service';
import { ExcellenceController } from './excellence.controller';
import { ExcellenceService } from './excellence.service';

@Module({
  controllers: [ExcellenceController],
  providers: [ExcellenceService, PrismaService],
  exports: [ExcellenceService],
})
export class ExcellenceModule {}
