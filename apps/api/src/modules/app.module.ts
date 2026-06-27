import { Module } from '@nestjs/common';
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

@Module({
  imports: [ThrottlerModule.forRoot([{ ttl: 60_000, limit: 120 }])],
  controllers: [AuthController, LmsController, CertificateController, AiController, AutomationController, AdminController],
  providers: [AuthService, LmsService, CertificateService, AiService, AutomationService, AdminService, PrismaService],
})
export class AppModule {}
