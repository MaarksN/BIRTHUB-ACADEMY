import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../common/prisma.service';
import type { UpdateUserRoleInput, ReviewSubmissionInput } from '@inside/schemas';
import { RoleCode } from '@prisma/client';
import type { AuthContext } from '../auth/auth.types';

@Injectable()
export class AdminService {
  constructor(private readonly prisma: PrismaService) {}

  async listUsers(auth: AuthContext) {
    return this.prisma.user.findMany({
      where: { memberships: { some: { tenantId: auth.activeTenantId } }, deletedAt: null },
      select: {
        id: true,
        name: true,
        email: true,
        locale: true,
        createdAt: true,
        memberships: {
          where: { tenantId: auth.activeTenantId },
          select: { role: { select: { code: true, name: true } } },
        },
      },
      orderBy: { createdAt: 'desc' },
    });
  }

  async updateUserRole(userId: string, input: UpdateUserRoleInput, auth: AuthContext) {
    const membership = await this.prisma.membership.findFirst({
      where: { userId, tenantId: auth.activeTenantId },
    });

    if (!membership) throw new NotFoundException('Usuário não pertence ao tenant ativo');

    const role = await this.prisma.role.findFirst({
      where: { tenantId: auth.activeTenantId, code: input.role as RoleCode },
    });

    if (!role) throw new NotFoundException('Papel não encontrado');

    return this.prisma.$transaction(async (tx) => {
      const updated = await tx.membership.update({ where: { id: membership.id }, data: { roleId: role.id } });
      await tx.auditLog.create({
        data: {
          tenantId: auth.activeTenantId,
          actorId: auth.userId,
          action: 'membership.role_changed',
          entity: 'Membership',
          entityId: membership.id,
          metadata: { targetUserId: userId, role: input.role },
        },
      });
      return updated;
    });
  }

  async listSubmissions(auth: AuthContext) {
    return this.prisma.submission.findMany({
      where: { tenantId: auth.activeTenantId },
      include: { user: { select: { id: true, name: true, email: true } }, files: true, reviews: true },
      orderBy: { createdAt: 'desc' },
    });
  }

  async reviewSubmission(submissionId: string, input: ReviewSubmissionInput, auth: AuthContext) {
    const submission = await this.prisma.submission.findFirst({
      where: { id: submissionId, tenantId: auth.activeTenantId },
    });
    if (!submission) throw new NotFoundException('Submissão não encontrada');
    return this.prisma.$transaction(async (tx) => {
      const review = await tx.review.create({
        data: {
          tenantId: auth.activeTenantId,
          submissionId,
          reviewerId: auth.userId,
          status: input.status,
          score: input.score,
          feedback: input.note,
          scores: {
            create: input.rubricScores.map((score) => ({
              tenantId: auth.activeTenantId,
              criterionId: score.criterionId,
              score: score.score,
              note: score.note,
            })),
          },
        },
        include: { scores: true },
      });
      await tx.submission.update({
        where: { id: submissionId },
        data: { status: input.status, score: input.score, reviewedBy: auth.userId, reviewedAt: new Date() },
      });
      await tx.auditLog.create({
        data: {
          tenantId: auth.activeTenantId,
          actorId: auth.userId,
          action: 'submission.reviewed',
          entity: 'Submission',
          entityId: submissionId,
          metadata: { status: input.status, score: input.score ?? null },
        },
      });
      return review;
    });
  }

  async listCertificates(auth: AuthContext) {
    return this.prisma.certificate.findMany({
      where: { tenantId: auth.activeTenantId },
      include: { user: { select: { id: true, name: true, email: true } } },
      orderBy: { issuedAt: 'desc' },
    });
  }

  async listAuditLogs(auth: AuthContext) {
    return this.prisma.auditLog.findMany({
      where: { tenantId: auth.activeTenantId },
      orderBy: { createdAt: 'desc' },
      take: 100,
    });
  }
}
