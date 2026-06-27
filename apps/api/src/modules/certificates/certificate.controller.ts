import { Body, Controller, Get, Param, Post, Query } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { z } from 'zod';
import type { AuthContext } from '../auth/auth.types';
import { CurrentAuth } from '../common/decorators/current-auth.decorator';
import { Public } from '../common/decorators/public.decorator';
import { CertificateService } from './certificate.service';

const issueSchema = z.object({ courseId: z.string().min(1).optional() });

@ApiTags('certificates')
@Controller()
export class CertificateController {
  constructor(private readonly certificates: CertificateService) {}

  @Get('me/certificates/eligibility')
  eligibility(@Query('courseId') courseId: string | undefined, @CurrentAuth() auth: AuthContext) {
    return this.certificates.eligibility(courseId, auth);
  }

  @Post('me/certificates')
  issue(@Body() body: unknown, @CurrentAuth() auth: AuthContext) {
    return this.certificates.issue(issueSchema.parse(body).courseId, auth);
  }

  @Get('certificates/:certificateId')
  getOne(@Param('certificateId') certificateId: string, @CurrentAuth() auth: AuthContext) {
    return this.certificates.getOne(certificateId, auth);
  }

  @Public()
  @Get('certificates/verify/:code')
  verify(@Param('code') code: string) {
    return this.certificates.verify(code);
  }
}

