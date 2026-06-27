import { Body, Controller, Get, Param, Patch, Post, Query, UseGuards } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { courseData, questionData, automationTemplateData, promptTemplateData } from '@inside/content';
import { AdminService } from './admin.service';
import { updateUserRoleSchema, reviewSubmissionSchema } from '@inside/schemas';
import { RolesGuard } from '../common/guards/roles.guard';
import { Roles } from '../common/decorators/roles.decorator';

@ApiTags('admin')
@Controller('admin')
@UseGuards(RolesGuard)
@Roles('ADMIN')
export class AdminController {
  constructor(private readonly adminService: AdminService) {}

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
  async listUsers(@Query('tenantId') tenantId: string) {
    return this.adminService.listUsers(tenantId || 'default');
  }

  @Patch('users/:id/role')
  async updateUserRole(@Param('id') id: string, @Body() body: unknown) {
    const input = updateUserRoleSchema.parse(body);
    return this.adminService.updateUserRole(id, input);
  }

  @Get('submissions')
  async listSubmissions(@Query('tenantId') tenantId: string) {
    return this.adminService.listSubmissions(tenantId || 'default');
  }

  @Patch('submissions/:id/review')
  async reviewSubmission(@Param('id') id: string, @Body() body: unknown) {
    const input = reviewSubmissionSchema.parse(body);
    return this.adminService.reviewSubmission(id, input);
  }

  @Get('certificates')
  async listCertificates(@Query('tenantId') tenantId: string) {
    return this.adminService.listCertificates(tenantId || 'default');
  }

  @Post('certificates/:id/revoke')
  async revokeCertificate(@Param('id') id: string) {
    return this.adminService.revokeCertificate(id);
  }

  @Get('audit-logs')
  async listAuditLogs(@Query('tenantId') tenantId: string) {
    return this.adminService.listAuditLogs(tenantId || 'default');
  }
}
