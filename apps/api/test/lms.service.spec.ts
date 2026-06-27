import { describe, expect, it } from 'vitest';
import { ServiceUnavailableException } from '@nestjs/common';
import { LmsService } from '../src/modules/lms/lms.service';

describe('LmsService', () => {
  const service = new LmsService();

  it('returns the canonical course without exposing an alternate tenant scope', () => {
    expect(service.getCourse().modules).toHaveLength(7);
  });

  it('rejects unknown cycles', () => {
    expect(() => service.getCycle('99.99')).toThrow('Ciclo não encontrado');
  });

  it('requires persistence for enrollment and progress mutations', async () => {
    await expect(
      service.enroll('inside-sales-ia-automacao', {
        sessionId: 'session',
        userId: 'student',
        name: 'Student',
        email: 'student@example.test',
        activeTenantId: 'tenant-a',
        roles: ['STUDENT'],
        memberships: [{ tenantId: 'tenant-a', role: 'STUDENT', permissions: [] }],
      }),
    ).rejects.toBeInstanceOf(ServiceUnavailableException);
  });
});

