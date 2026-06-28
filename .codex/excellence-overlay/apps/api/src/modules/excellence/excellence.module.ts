import { Module } from '@nestjs/common';
import { ExcellenceController } from './excellence.controller';
import { ExcellenceService } from './excellence.service';

@Module({
  controllers: [ExcellenceController],
  providers: [ExcellenceService],
  exports: [ExcellenceService],
})
export class ExcellenceModule {}
