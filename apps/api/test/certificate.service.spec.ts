import { describe, expect, it, vi } from 'vitest';
import type { PrismaService } from '../src/modules/common/prisma.service';
import type { LmsService } from '../src/modules/lms/lms.service';
import type { StorageService } from '../src/modules/submissions/storage.service';
import { CertificateService } from '../src/modules/certificates/certificate.service';

const auth = {
  sessionId: 'session',
  userId: 'student',
  name: 'Aluno',
  email: 'student@example.test',
  activeTenantId: 'tenant-a',
  roles: ['STUDENT' as const],
  memberships: [{ tenantId: 'tenant-a', role: 'STUDENT' as const, permissions: [] }],
};

describe('CertificateService', () => {
  it('reports missing active enrollment from server-side state', async () => {
    const prisma = { enrollment: { findFirst: vi.fn().mockResolvedValue(null) } } as unknown as PrismaService;
    const service = new CertificateService(prisma, {} as LmsService, {} as StorageService);
    await expect(service.eligibility(undefined, auth)).resolves.toMatchObject({
      eligible: false,
      missing: ['matrícula ativa'],
    });
  });

  it('does not consider a code valid merely because its format looks valid', async () => {
    const prisma = { certificate: { findUnique: vi.fn().mockResolvedValue(null) } } as unknown as PrismaService;
    const service = new CertificateService(prisma, {} as LmsService, {} as StorageService);
    await expect(service.verify('ISIA-ABCDEF123456')).resolves.toEqual({
      valid: false,
      status: 'NOT_FOUND',
      code: 'ISIA-ABCDEF123456',
    });
  });
});
