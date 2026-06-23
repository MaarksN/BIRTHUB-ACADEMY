import { Body, Controller, Get, Param, Post } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { progressEventSchema, quizStartSchema } from '@inside/schemas';
import { LmsService } from './lms.service';

@ApiTags('lms')
@Controller('lms')
export class LmsController {
  constructor(private readonly lmsService: LmsService) {}

  @Get('course')
  getCourse() {
    return this.lmsService.getCourse();
  }

  @Get('cycles/:cycleCode')
  getCycle(@Param('cycleCode') cycleCode: string) {
    return this.lmsService.getCycle(cycleCode);
  }

  @Post('quizzes/start')
  startQuiz(@Body() body: unknown) {
    const input = quizStartSchema.parse(body);
    return this.lmsService.startQuiz(input.cycleCode, input.attemptSeed, {
      completedCycles: [],
      submittedActivities: [],
      passedQuizzes: [],
      projectScores: {},
      averageScore: 0,
    });
  }

  @Post('progress/events')
  recordProgressEvent(@Body() body: unknown) {
    return this.lmsService.recordProgressEvent(progressEventSchema.parse(body));
  }
}
