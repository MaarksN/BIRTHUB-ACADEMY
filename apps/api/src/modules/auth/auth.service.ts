import { Injectable, UnauthorizedException } from '@nestjs/common';
import bcrypt from 'bcryptjs';
import crypto from 'node:crypto';
import { PrismaService } from '../common/prisma.service';
import { hashSessionToken } from '../common/guards/auth.guard';
import type { AuthContext } from './auth.types';

@Injectable()
export class AuthService {
  constructor(private readonly prisma: PrismaService) {}

  async login(email: string, password: string, tenantSlug: string) {
    const organization = await this.prisma.organization.findFirst({
      where: { slug: tenantSlug, deletedAt: null },
    });
    const user = organization
      ? await this.prisma.user.findFirst({
          where: {
            email: email.trim().toLowerCase(),
            deletedAt: null,
            memberships: { some: { organizationId: organization.id, tenantId: organization.tenantId } },
          },
          include: {
            memberships: {
              where: { organizationId: organization.id },
              include: { role: true },
            },
          },
        })
      : null;
    if (!user || !(await bcrypt.compare(password, user.passwordHash))) {
      throw new UnauthorizedException('Credenciais inválidas');
    }

    const rawToken = crypto.randomBytes(32).toString('base64url');
    const ttlHours = Number(process.env.SESSION_TTL_HOURS ?? 8);
    const expiresAt = new Date(Date.now() + ttlHours * 60 * 60 * 1000);
    await this.prisma.session.create({
      data: {
        tokenHash: hashSessionToken(rawToken),
        userId: user.id,
        activeTenantId: organization!.tenantId,
        expiresAt,
      },
    });

    return {
      sessionId: rawToken,
      expiresAt,
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        activeTenantId: organization!.tenantId,
        roles: user.memberships.map((membership) => membership.role.code),
      },
    };
  }

  me(auth: AuthContext) {
    return {
      id: auth.userId,
      name: auth.name,
      email: auth.email,
      roles: auth.roles,
      memberships: auth.memberships.map(({ tenantId, role }) => ({ tenantId, role })),
      activeTenantId: auth.activeTenantId,
    };
  }

  async logout(rawToken: string | undefined) {
    if (!rawToken) return;
    await this.prisma.session.updateMany({
      where: { tokenHash: hashSessionToken(rawToken), revokedAt: null },
      data: { revokedAt: new Date() },
    });
  }
}
