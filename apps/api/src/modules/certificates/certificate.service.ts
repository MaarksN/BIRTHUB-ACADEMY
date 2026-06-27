import { ForbiddenException, Injectable, NotFoundException } from '@nestjs/common';
import crypto from 'node:crypto';
import { PDFDocument, StandardFonts, rgb } from 'pdf-lib';
import { canIssueCertificate, courseData } from '@inside/content';
import type { AuthContext } from '../auth/auth.types';
import { PrismaService } from '../common/prisma.service';
import { LmsService } from '../lms/lms.service';
import { StorageService } from '../submissions/storage.service';

@Injectable()
export class CertificateService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly lms: LmsService,
    private readonly storage: StorageService,
  ) {}

  async eligibility(courseId = courseData.id, auth: AuthContext) {
    const enrollment = await this.prisma.enrollment.findFirst({
      where: {
        tenantId: auth.activeTenantId,
        userId: auth.userId,
        status: 'active',
        deletedAt: null,
        courseVersion: { courseId },
      },
      include: { courseVersion: { include: { course: true } } },
    });
    if (!enrollment) return { eligible: false, missing: ['matrícula ativa'], courseId };
    const progress = await this.lms.getLearnerProgress(auth);
    const result = canIssueCertificate(progress);
    return {
      eligible: result.ok,
      missing: result.missing,
      courseId,
      courseVersionId: enrollment.courseVersionId,
      progress,
    };
  }

  async issue(courseId = courseData.id, auth: AuthContext) {
    const eligibility = await this.eligibility(courseId, auth);
    if (!eligibility.eligible || !eligibility.courseVersionId || !eligibility.progress) {
      throw new ForbiddenException({ message: 'Requisitos do certificado não atendidos', missing: eligibility.missing });
    }
    const existing = await this.prisma.certificate.findUnique({
      where: {
        tenantId_userId_courseVersionId: {
          tenantId: auth.activeTenantId,
          userId: auth.userId,
          courseVersionId: eligibility.courseVersionId,
        },
      },
    });
    if (existing) return existing;

    const code = `ISIA-${crypto.randomBytes(9).toString('hex').toUpperCase()}`;
    const issuedAt = new Date();
    const payload = {
      code,
      studentName: auth.name,
      course: courseData.title,
      workloadHours: courseData.estimatedHours,
      version: courseData.version,
      issuedAt: issuedAt.toISOString(),
      finalAverage: eligibility.progress.averageScore,
      verificationUrl: `${process.env.WEB_ORIGIN ?? 'http://localhost:3000'}/certificado/${code}`,
      institution: courseData.institution,
    };
    const pdfObjectKey = `${auth.activeTenantId}/certificates/${code}.pdf`;
    await this.storage.storeBuffer(pdfObjectKey, await this.renderPdf(payload), 'application/pdf');

    return this.prisma.$transaction(async (tx) => {
      const certificate = await tx.certificate.create({
        data: {
          tenantId: auth.activeTenantId,
          userId: auth.userId,
          courseVersionId: eligibility.courseVersionId!,
          code,
          issuedAt,
          pdfObjectKey,
          payload,
        },
      });
      await tx.auditLog.create({
        data: {
          tenantId: auth.activeTenantId,
          actorId: auth.userId,
          action: 'certificate.issued',
          entity: 'Certificate',
          entityId: certificate.id,
          metadata: { code, courseId },
        },
      });
      return certificate;
    });
  }

  async getOne(id: string, auth: AuthContext) {
    const certificate = await this.prisma.certificate.findFirst({
      where: { id, tenantId: auth.activeTenantId },
    });
    if (!certificate) throw new NotFoundException('Certificado não encontrado');
    if (certificate.userId !== auth.userId && !auth.roles.some((role) => role === 'ADMIN' || role === 'OWNER')) {
      throw new ForbiddenException('Certificado pertence a outro usuário');
    }
    return certificate;
  }

  async verify(code: string) {
    const certificate = await this.prisma.certificate.findUnique({
      where: { code },
      include: { user: { select: { name: true } }, courseVersion: { include: { course: true } } },
    });
    if (!certificate) return { valid: false, status: 'NOT_FOUND', code };
    await this.prisma.certificateVerification.create({
      data: { certificateId: certificate.id, code, result: certificate.status },
    });
    return {
      valid: certificate.status === 'VALID',
      status: certificate.status,
      code,
      studentName: certificate.user.name,
      course: certificate.courseVersion.course.title,
      issuedAt: certificate.issuedAt,
      revokedAt: certificate.revokedAt,
      revocationReason: certificate.revocationReason,
    };
  }

  async revoke(id: string, reason: string, auth: AuthContext) {
    const certificate = await this.prisma.certificate.findFirst({ where: { id, tenantId: auth.activeTenantId } });
    if (!certificate) throw new NotFoundException('Certificado não encontrado');
    return this.prisma.$transaction(async (tx) => {
      const revoked = await tx.certificate.update({
        where: { id },
        data: { status: 'REVOKED', revokedAt: new Date(), revokedById: auth.userId, revocationReason: reason },
      });
      await tx.auditLog.create({
        data: {
          tenantId: auth.activeTenantId,
          actorId: auth.userId,
          action: 'certificate.revoked',
          entity: 'Certificate',
          entityId: id,
          metadata: { reason },
        },
      });
      return revoked;
    });
  }

  private async renderPdf(payload: { code: string; studentName: string; course: string; issuedAt: string }) {
    const document = await PDFDocument.create();
    const page = document.addPage([842, 595]);
    const font = await document.embedFont(StandardFonts.Helvetica);
    const bold = await document.embedFont(StandardFonts.HelveticaBold);
    page.drawRectangle({ x: 25, y: 25, width: 792, height: 545, borderWidth: 3, borderColor: rgb(0.08, 0.23, 0.35) });
    page.drawText('CERTIFICADO DE CONCLUSÃO', { x: 205, y: 455, size: 28, font: bold, color: rgb(0.08, 0.23, 0.35) });
    page.drawText('Certificamos que', { x: 330, y: 390, size: 16, font });
    page.drawText(payload.studentName, { x: 260, y: 340, size: 26, font: bold });
    page.drawText(`concluiu o curso ${payload.course}`, { x: 150, y: 290, size: 16, font });
    page.drawText(`Emitido em ${new Date(payload.issuedAt).toLocaleDateString('pt-BR')}`, { x: 315, y: 180, size: 12, font });
    page.drawText(`Código de verificação: ${payload.code}`, { x: 290, y: 145, size: 11, font });
    return document.save();
  }
}
