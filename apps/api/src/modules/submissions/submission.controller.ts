import { Body, Controller, Get, Param, Post } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { z } from 'zod';
import { submissionSchema } from '@inside/schemas';
import type { AuthContext } from '../auth/auth.types';
import { CurrentAuth } from '../common/decorators/current-auth.decorator';
import { StorageService } from './storage.service';
import { SubmissionService } from './submission.service';

const uploadRequestSchema = z.object({
  originalName: z.string().min(1).max(255),
  mimeType: z.string().min(1),
  sizeBytes: z.number().int().positive(),
});

@ApiTags('submissions')
@Controller()
export class SubmissionController {
  constructor(
    private readonly submissions: SubmissionService,
    private readonly storage: StorageService,
  ) {}

  @Post('uploads/presign')
  presign(@Body() body: unknown, @CurrentAuth() auth: AuthContext) {
    return this.storage.createUploadUrl(uploadRequestSchema.parse(body), auth);
  }

  @Post('activities/:activityId/submissions')
  submitActivity(@Param('activityId') id: string, @Body() body: unknown, @CurrentAuth() auth: AuthContext) {
    return this.submissions.create('activity', id, submissionSchema.parse(body), auth);
  }

  @Post('projects/:projectId/submissions')
  submitProject(@Param('projectId') id: string, @Body() body: unknown, @CurrentAuth() auth: AuthContext) {
    return this.submissions.create('project', id, submissionSchema.parse(body), auth);
  }

  @Post('final-challenge/:challengeId/submissions')
  submitChallenge(@Param('challengeId') id: string, @Body() body: unknown, @CurrentAuth() auth: AuthContext) {
    return this.submissions.create('challenge', id, submissionSchema.parse(body), auth);
  }

  @Get('me/submissions')
  mine(@CurrentAuth() auth: AuthContext) {
    return this.submissions.listMine(auth);
  }
}

