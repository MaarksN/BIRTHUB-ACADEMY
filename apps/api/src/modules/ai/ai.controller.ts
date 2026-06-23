import { Body, Controller, Post } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { AiService } from './ai.service';

@ApiTags('ai-lab')
@Controller('ai-lab')
export class AiController {
  constructor(private readonly aiService: AiService) {}

  @Post('run')
  run(@Body() body: unknown) {
    return this.aiService.run(body);
  }
}
