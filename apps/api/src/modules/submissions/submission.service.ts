import { ForbiddenException, Injectable, NotFoundException } from '@nestjs/common';
import { Prisma } from '@prisma/client';
import type { SubmissionInput } from '@inside/schemas';
import type { AuthContext } from '../auth/auth.types';
import { PrismaService } from '../common/prisma.service';

type OwnerKind = 'activity' | 'project' | 'challenge';

@Injectable()
export class SubmissionService {
  constructor(private readonly prisma: PrismaService) {}

  async create(kind: OwnerKind, ownerId: string, input: SubmissionInput, auth: AuthContext) {
    const ownerExists = await this.ownerExists(kind, ownerId, auth.activeTenantId);
    if (!ownerExists) throw new NotFoundException('Atividade, projeto ou desafio não encontrado');
    const enrollment = await this.prisma.enrollment.findFirst({
      where: { tenantId: auth.activeTenantId, userId: auth.userId, status: 'active', deletedAt: null },
    });
    if (!enrollment) throw new ForbiddenException('Matrícula ativa necessária');
    const expectedPrefix = `${auth.activeTenantId}/${auth.userId}/`;
    if (input.files.some(({ objectKey }) => !objectKey.startsWith(expectedPrefix))) {
      throw new ForbiddenException('Arquivo não pertence ao usuário autenticado');
    }

    const ownerFields = {
      activityId: kind === 'activity' ? ownerId : undefined,
      projectId: kind === 'project' ? ownerId : undefined,
      challengeId: kind === 'challenge' ? ownerId : undefined,
    };
    return this.prisma.$transaction(async (tx) => {
      const submission = await tx.submission.create({
        data: {
          tenantId: auth.activeTenantId,
          userId: auth.userId,
          ...ownerFields,
          payload: input.payload as Prisma.InputJsonValue,
          files: {
            create: input.files.map((file) => ({
              tenantId: auth.activeTenantId,
              objectKey: file.objectKey,
              originalName: file.originalName,
              mimeType: file.mimeType,
              sizeBytes: file.sizeBytes,
            })),
          },
        },
        include: { files: true },
      });
      await tx.auditLog.create({
        data: {
          tenantId: auth.activeTenantId,
          actorId: auth.userId,
          action: `${kind}.submitted`,
          entity: 'Submission',
          entityId: submission.id,
          metadata: { ownerId, fileCount: input.files.length },
        },
      });
      return submission;
    });
  }

  listMine(auth: AuthContext) {
    return this.prisma.submission.findMany({
      where: { tenantId: auth.activeTenantId, userId: auth.userId },
      include: { files: true, reviews: { orderBy: { createdAt: 'desc' }, take: 1 } },
      orderBy: { createdAt: 'desc' },
    });
  }

  private ownerExists(kind: OwnerKind, id: string, tenantId: string) {
    if (kind === 'activity') return this.prisma.activity.findFirst({ where: { id, tenantId }, select: { id: true } });
    if (kind === 'project') return this.prisma.project.findFirst({ where: { id, tenantId }, select: { id: true } });
    return this.prisma.finalChallenge.findFirst({ where: { id, tenantId }, select: { id: true } });
  }
}

