import { CanActivate, ExecutionContext, Injectable, UnauthorizedException } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import crypto from 'node:crypto';
import type { Request } from 'express';
import { PrismaService } from '../prisma.service';
import { IS_PUBLIC_KEY } from '../decorators/public.decorator';
import type { AuthContext } from '../../auth/auth.types';

export const hashSessionToken = (token: string) => crypto.createHash('sha256').update(token).digest('hex');

@Injectable()
export class AuthGuard implements CanActivate {
  constructor(private readonly reflector: Reflector, private readonly prisma: PrismaService) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const isPublic = this.reflector.getAllAndOverride<boolean>(IS_PUBLIC_KEY, [
      context.getHandler(),
      context.getClass(),
    ]);
    if (isPublic) return true;

    const request = context.switchToHttp().getRequest<Request & { auth?: AuthContext }>();
    const token = request.cookies?.inside_session as string | undefined;
    if (!token) throw new UnauthorizedException('Autenticação necessária');

    const session = await this.prisma.session.findUnique({
      where: { tokenHash: hashSessionToken(token) },
      include: {
        user: {
          include: {
            memberships: {
              include: { role: true, organization: true },
            },
          },
        },
      },
    });

    if (!session || session.revokedAt || session.expiresAt <= new Date() || session.user.deletedAt) {
      throw new UnauthorizedException('Sessão inválida ou expirada');
    }

    const memberships = session.user.memberships
      .filter((membership) => !membership.organization.deletedAt)
      .map((membership) => ({
        tenantId: membership.tenantId,
        role: membership.role.code,
        permissions: membership.role.permissions,
      }));
    const activeMembership = memberships.find((membership) => membership.tenantId === session.activeTenantId);
    if (!activeMembership) throw new UnauthorizedException('Tenant ativo não autorizado');

    request.auth = {
      sessionId: session.id,
      userId: session.user.id,
      name: session.user.name,
      email: session.user.email,
      activeTenantId: session.activeTenantId,
      roles: [activeMembership.role],
      memberships,
    };
    return true;
  }
}

