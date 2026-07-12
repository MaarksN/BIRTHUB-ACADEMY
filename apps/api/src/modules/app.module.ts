import { Module } from '@nestjs/common';
import { APP_GUARD } from '@nestjs/core';
import { ThrottlerModule } from '@nestjs/throttler';
import { AuthController } from './auth/auth.controller';
import { AuthService } from './auth/auth.service';
import { LmsController } from './lms/lms.controller';
import { LmsService } from './lms/lms.service';
import { CertificateController } from './certificates/certificate.controller';
import { CertificateService } from './certificates/certificate.service';
import { AiController } from './ai/ai.controller';
import { AiService } from './ai/ai.service';
import { AutomationController } from './automations/automation.controller';
import { AutomationService } from './automations/automation.service';
import { AdminController } from './admin/admin.controller';
import { AdminService } from './admin/admin.service';
import { PrismaService } from './common/prisma.service';
import { AuthGuard } from './common/guards/auth.guard';
import { RolesGuard } from './common/guards/roles.guard';
import { SubmissionController } from './submissions/submission.controller';
import { SubmissionService } from './submissions/submission.service';
import { StorageService } from './submissions/storage.service';
import { HealthController } from './health/health.controller';

@Module({
  imports: [ThrottlerModule.forRoot([{ ttl: 60_000, limit: 120 }])],
  controllers: [AuthController, LmsController, CertificateController, AiController, AutomationController, AdminController, SubmissionController, HealthController],
  providers: [
    AuthService,
    LmsService,
    CertificateService,
    AiService,
    AutomationService,
    AdminService,
    SubmissionService,
    StorageService,
    PrismaService,
    { provide: APP_GUARD, useClass: AuthGuard },
    { provide: APP_GUARD, useClass: RolesGuard },
  ],
})
export class AppModule {}
