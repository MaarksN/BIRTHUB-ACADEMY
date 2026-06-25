import { Injectable, Optional } from '@nestjs/common';
import crypto from 'node:crypto';
import { canIssueCertificate, courseData, type LearnerProgress } from '@inside/content';
import type { Prisma } from '@prisma/client';
import { PrismaService } from '../common/prisma.service';

@Injectable()
export class CertificateService {
  constructor(@Optional() private readonly prisma?: PrismaService) {}

  async issue(input: {
    userName: string;
    progress: LearnerProgress;
    tenantId?: string;
    userId?: string;
    courseVersionId?: string;
  }) {
    const { userName, progress } = input;
    const eligibility = canIssueCertificate(progress);
    if (!eligibility.ok) return { issued: false, missing: eligibility.missing };
    const code = `ISIA-${crypto.createHash('sha256').update(`${userName}:${Date.now()}`).digest('hex').slice(0, 12).toUpperCase()}`;
    const payload = {
      code,
      studentName: userName,
      course: courseData.title,
      workloadHours: courseData.estimatedHours,
      version: courseData.version,
      issuedAt: new Date().toISOString(),
      finalAverage: progress.averageScore,
      competencies: courseData.modules.flatMap((module) => module.cycles.flatMap((cycle) => cycle.competencies)).slice(0, 24),
      verificationUrl: `/certificates/verify/${code}`,
      institution: courseData.institution,
      responsible: courseData.responsible,
      status: 'VALID',
    };

    if (this.prisma && process.env.DATABASE_URL && input.tenantId && input.userId) {
      const certificate = await this.prisma.certificate.create({
        data: {
          tenantId: input.tenantId,
          userId: input.userId,
          courseVersionId: input.courseVersionId ?? `${courseData.id}@${courseData.version}`,
          code,
          payload: payload as any,
        },
      });
      return { issued: true, persisted: true, certificate: { ...payload, id: certificate.id } };
    }

    return {
      issued: true,
      persisted: false,
      reason: 'DATABASE_URL, tenantId ou userId ausente; certificado elegível, mas não gravado.',
      certificate: payload,
    };
  }

  async verify(code: string) {
    if (this.prisma && process.env.DATABASE_URL) {
      const certificate = await this.prisma.certificate.findUnique({ where: { code } });
      if (!certificate) {
        return { code, status: 'NOT_FOUND', checkedAt: new Date().toISOString(), source: 'backend-verification-route' };
      }
      await this.prisma.certificateVerification.create({
        data: {
          certificateId: certificate.id,
          code,
          result: certificate.status,
        },
      });
      return {
        code,
        status: certificate.status,
        checkedAt: new Date().toISOString(),
        source: 'database',
        certificate: certificate.payload,
      };
    }

    return {
      code,
      status: code.startsWith('ISIA-') ? 'VALID' : 'NOT_FOUND',
      checkedAt: new Date().toISOString(),
      source: 'backend-verification-route-fallback',
    };
  }
}
