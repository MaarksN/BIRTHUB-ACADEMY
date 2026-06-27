import { Body, Controller, Get, Param, Patch, Post, UseGuards } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { courseData, questionData, automationTemplateData, promptTemplateData } from '@inside/content';
import { AdminService } from './admin.service';
import { updateUserRoleSchema, reviewSubmissionSchema } from '@inside/schemas';
import { RolesGuard } from '../common/guards/roles.guard';
import { Roles } from '../common/decorators/roles.decorator';
import { CurrentAuth } from '../common/decorators/current-auth.decorator';
import type { AuthContext } from '../auth/auth.types';
import { CertificateService } from '../certificates/certificate.service';
import { z } from 'zod';

@ApiTags('admin')
@Controller('admin')
@UseGuards(RolesGuard)
@Roles('ADMIN')
export class AdminController {
  constructor(private readonly adminService: AdminService, private readonly certificates: CertificateService) {}

  @Get('overview')
  overview() {
    return {
      modules: courseData.modules.length,
      cycles: courseData.modules.flatMap((module) => module.cycles).length,
      questions: questionData.length,
      automationTemplates: automationTemplateData.length,
      promptTemplates: promptTemplateData.length,
    };
  }

  @Get('users')
  async listUsers(@CurrentAuth() auth: AuthContext) {
    return this.adminService.listUsers(auth);
  }

  @Patch('users/:id/role')
  async updateUserRole(@Param('id') id: string, @Body() body: unknown, @CurrentAuth() auth: AuthContext) {
    const input = updateUserRoleSchema.parse(body);
    return this.adminService.updateUserRole(id, input, auth);
  }

  @Get('submissions')
  async listSubmissions(@CurrentAuth() auth: AuthContext) {
    return this.adminService.listSubmissions(auth);
  }

  @Patch('submissions/:id/review')
  async reviewSubmission(@Param('id') id: string, @Body() body: unknown, @CurrentAuth() auth: AuthContext) {
    const input = reviewSubmissionSchema.parse(body);
    return this.adminService.reviewSubmission(id, input, auth);
  }

  @Get('certificates')
  async listCertificates(@CurrentAuth() auth: AuthContext) {
    return this.adminService.listCertificates(auth);
  }

  @Post('certificates/:id/revoke')
  async revokeCertificate(@Param('id') id: string, @Body() body: unknown, @CurrentAuth() auth: AuthContext) {
    const { reason } = z.object({ reason: z.string().min(3).max(1000) }).parse(body);
    return this.certificates.revoke(id, reason, auth);
  }

  @Get('audit-logs')
  async listAuditLogs(@CurrentAuth() auth: AuthContext) {
    return this.adminService.listAuditLogs(auth);
  }
}
