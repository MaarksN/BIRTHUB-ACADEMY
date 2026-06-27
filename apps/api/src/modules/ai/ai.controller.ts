import { Body, Controller, Post } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { AiService } from './ai.service';
import { CurrentAuth } from '../common/decorators/current-auth.decorator';
import type { AuthContext } from '../auth/auth.types';

@ApiTags('ai-lab')
@Controller('ai-lab')
export class AiController {
  constructor(private readonly aiService: AiService) {}

  @Post('run')
  run(@Body() body: unknown, @CurrentAuth() auth: AuthContext) {
    return this.aiService.run(body, auth);
  }
}
