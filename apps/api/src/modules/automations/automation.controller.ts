import { Body, Controller, Get, Post } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { AutomationService } from './automation.service';

@ApiTags('automations')
@Controller('automations')
export class AutomationController {
  constructor(private readonly automationService: AutomationService) {}

  @Get('templates')
  templates() {
    return this.automationService.templates();
  }

  @Post('simulate')
  simulate(@Body() body: unknown) {
    return this.automationService.simulate(body);
  }
}
