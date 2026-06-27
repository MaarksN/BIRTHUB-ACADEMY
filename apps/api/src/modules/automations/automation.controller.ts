import { Body, Controller, Get, Post } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { AutomationService } from './automation.service';
import { CurrentAuth } from '../common/decorators/current-auth.decorator';
import type { AuthContext } from '../auth/auth.types';

@ApiTags('automations')
@Controller('automations')
export class AutomationController {
  constructor(private readonly automationService: AutomationService) {}

  @Get('templates')
  templates() {
    return this.automationService.templates();
  }

  @Post('simulate')
  simulate(@Body() body: unknown, @CurrentAuth() auth: AuthContext) {
    return this.automationService.simulate(body, auth);
  }
}
