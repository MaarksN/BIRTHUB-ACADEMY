import { Body, Controller, Get, Param, Post } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { quizAnswerSchema } from '@inside/schemas';
import { CurrentAuth } from '../common/decorators/current-auth.decorator';
import type { AuthContext } from '../auth/auth.types';
import { LmsService } from './lms.service';

@ApiTags('lms')
@Controller()
export class LmsController {
  constructor(private readonly lmsService: LmsService) {}

  @Get('lms/course')
  getCourse() {
    return this.lmsService.getCourse();
  }

  @Get('lms/cycles/:cycleCode')
  getCycle(@Param('cycleCode') cycleCode: string) {
    return this.lmsService.getCycle(cycleCode);
  }

  @Post('courses/:courseId/enroll')
  enroll(@Param('courseId') courseId: string, @CurrentAuth() auth: AuthContext) {
    return this.lmsService.enroll(courseId, auth);
  }

  @Get('me/enrollments')
  enrollments(@CurrentAuth() auth: AuthContext) {
    return this.lmsService.getEnrollments(auth);
  }

  @Get('me/progress')
  progress(@CurrentAuth() auth: AuthContext) {
    return this.lmsService.getProgress(auth);
  }

  @Post('cycles/:cycleId/complete')
  completeCycle(@Param('cycleId') cycleId: string, @CurrentAuth() auth: AuthContext) {
    return this.lmsService.completeCycle(cycleId, auth);
  }

  @Post('quizzes/:quizId/attempts')
  startQuiz(@Param('quizId') quizId: string, @CurrentAuth() auth: AuthContext) {
    return this.lmsService.createQuizAttempt(quizId, auth);
  }

  @Post('quiz-attempts/:attemptId/answers')
  answerQuiz(
    @Param('attemptId') attemptId: string,
    @Body() body: unknown,
    @CurrentAuth() auth: AuthContext,
  ) {
    return this.lmsService.saveQuizAnswer(attemptId, quizAnswerSchema.parse(body), auth);
  }

  @Post('quiz-attempts/:attemptId/submit')
  submitQuiz(@Param('attemptId') attemptId: string, @CurrentAuth() auth: AuthContext) {
    return this.lmsService.submitQuizAttempt(attemptId, auth);
  }

  @Get('quiz-attempts/:attemptId')
  getAttempt(@Param('attemptId') attemptId: string, @CurrentAuth() auth: AuthContext) {
    return this.lmsService.getQuizAttempt(attemptId, auth);
  }

  @Get('me/quiz-attempts')
  getAttempts(@CurrentAuth() auth: AuthContext) {
    return this.lmsService.getQuizAttempts(auth);
  }
}

