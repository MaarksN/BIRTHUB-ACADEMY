import { Body, Controller, Get, Param, Post } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import {
  aiTutorRequestSchema,
  learningPlanRequestSchema,
  qualityScoreRequestSchema,
  supportTicketSchema,
} from '@inside/schemas';
import { Public } from '../common/decorators/public.decorator';
import { CurrentAuth } from '../common/decorators/current-auth.decorator';
import type { AuthContext } from '../auth/auth.types';
import { ExcellenceService } from './excellence.service';

@ApiTags('excellence')
@Controller('excellence')
export class ExcellenceController {
  constructor(private readonly excellenceService: ExcellenceService) {}

  @Public()
  @Get('items')
  listItems() {
    return this.excellenceService.listItems();
  }

  @Public()
  @Get('items/:slugOrNumber')
  getItem(@Param('slugOrNumber') slugOrNumber: string) {
    return this.excellenceService.getItem(slugOrNumber);
  }

  @Public()
  @Get('roadmap')
  getRoadmap() {
    return this.excellenceService.getRoadmap();
  }

  @Public()
  @Get('competencies')
  listCompetencies() {
    return this.excellenceService.listCompetencies();
  }

  @Public()
  @Get('pillars')
  listPillars() {
    return this.excellenceService.listPillars();
  }

  @Post('learning-plan')
  createLearningPlan(@Body() body: unknown, @CurrentAuth() auth: AuthContext) {
    return this.excellenceService.createLearningPlan(learningPlanRequestSchema.parse(body), auth);
  }

  @Get('learning-plans')
  listLearningPlans(@CurrentAuth() auth: AuthContext) {
    return this.excellenceService.listLearningPlans(auth);
  }

  @Post('ai-tutor')
  createTutorResponse(@Body() body: unknown, @CurrentAuth() auth: AuthContext) {
    return this.excellenceService.createTutorResponse(aiTutorRequestSchema.parse(body), auth);
  }

  @Post('quality-score')
  calculateQualityScore(@Body() body: unknown, @CurrentAuth() auth: AuthContext) {
    return this.excellenceService.calculateQualityScore(qualityScoreRequestSchema.parse(body), auth);
  }

  @Get('quality-scores/:courseId')
  listQualityScores(@Param('courseId') courseId: string, @CurrentAuth() auth: AuthContext) {
    return this.excellenceService.listQualityScores(courseId, auth);
  }

  @Post('support-ticket')
  createSupportTicket(@Body() body: unknown, @CurrentAuth() auth: AuthContext) {
    return this.excellenceService.createSupportTicket(supportTicketSchema.parse(body), auth);
  }

  @Get('support-tickets')
  listSupportTickets(@CurrentAuth() auth: AuthContext) {
    return this.excellenceService.listSupportTickets(auth);
  }
}
