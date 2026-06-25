import { Injectable, Optional } from '@nestjs/common';
import { PrismaService } from '../common/prisma.service';
import type { UpdateUserRoleInput, ReviewSubmissionInput } from '@inside/schemas';
import { RoleCode } from '@prisma/client';

@Injectable()
export class AdminService {
  constructor(@Optional() private readonly prisma?: PrismaService) {}

  async listUsers(tenantId: string) {
    if (!this.prisma) return [];
    return this.prisma.user.findMany({
      where: { tenantId, deletedAt: null },
      orderBy: { createdAt: 'desc' },
    });
  }

  async updateUserRole(userId: string, input: UpdateUserRoleInput) {
    if (!this.prisma) return null;
    // Note: In a real multi-tenant app, we'd find the membership and update the role.
    // For this demonstration, we'll assume a simplified role update on a Membership.
    const membership = await this.prisma.membership.findFirst({
      where: { userId },
    });

    if (!membership) return null;

    const role = await this.prisma.role.findFirst({
      where: { tenantId: membership.tenantId, code: input.role as RoleCode },
    });

    if (!role) return null;

    return this.prisma.membership.update({
      where: { id: membership.id },
      data: { roleId: role.id },
    });
  }

  async listSubmissions(tenantId: string) {
    if (!this.prisma) return [];
    return this.prisma.submission.findMany({
      where: { tenantId },
      orderBy: { createdAt: 'desc' },
    });
  }

  async reviewSubmission(submissionId: string, input: ReviewSubmissionInput) {
    if (!this.prisma) return null;
    return this.prisma.submission.update({
      where: { id: submissionId },
      data: {
        status: input.status,
        score: input.score,
        reviewedAt: new Date(),
      },
    });
  }

  async listCertificates(tenantId: string) {
    if (!this.prisma) return [];
    return this.prisma.certificate.findMany({
      where: { tenantId },
      orderBy: { issuedAt: 'desc' },
    });
  }

  async revokeCertificate(certificateId: string) {
    if (!this.prisma) return null;
    return this.prisma.certificate.update({
      where: { id: certificateId },
      data: {
        status: 'REVOKED',
        revokedAt: new Date(),
      },
    });
  }

  async listAuditLogs(tenantId: string) {
    if (!this.prisma) return [];
    return this.prisma.auditLog.findMany({
      where: { tenantId },
      orderBy: { createdAt: 'desc' },
      take: 100,
    });
  }
}
