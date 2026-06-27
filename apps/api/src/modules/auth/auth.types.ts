import type { RoleCode } from '@prisma/client';

export interface AuthMembership {
  tenantId: string;
  role: RoleCode;
  permissions: string[];
}

export interface AuthContext {
  sessionId: string;
  userId: string;
  name: string;
  email: string;
  activeTenantId: string;
  roles: RoleCode[];
  memberships: AuthMembership[];
}

