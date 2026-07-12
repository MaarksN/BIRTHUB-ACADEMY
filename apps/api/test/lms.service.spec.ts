import { describe, expect, it, vi, beforeEach } from 'vitest';
import { ServiceUnavailableException, NotFoundException } from '@nestjs/common';
import { LmsService } from '../src/modules/lms/lms.service';
import { AuthContext } from '../src/modules/auth/auth.types';

describe('LmsService', () => {
  let service: LmsService;
  const mockPrisma = {
    course: { findFirst: vi.fn() },
    cycle: { findFirst: vi.fn() },
    enrollment: { findFirst: vi.fn() },
  };

  beforeEach(() => {
    service = new LmsService(mockPrisma as any);
    vi.clearAllMocks();
  });

  const auth: AuthContext = {
    sessionId: 's',
    userId: 'u',
    name: 'User',
    email: 'u@example.com',
    activeTenantId: 'tenant',
    roles: ['STUDENT'],
    memberships: [{ tenantId: 'tenant', role: 'STUDENT', permissions: [] }],
  };

  it('returns the canonical course when available in tenant', async () => {
    mockPrisma.course.findFirst.mockResolvedValue({ id: 'course' });
    const course = await service.getCourse(auth);
    expect(course.modules).toHaveLength(7);
  });

  it('rejects unknown cycles', async () => {
    mockPrisma.cycle.findFirst.mockResolvedValue(null);
    await expect(service.getCycle('99.99', auth)).rejects.toThrow(NotFoundException);
  });

  it('requires persistence for enrollment and progress mutations', async () => {
    const serviceNoDb = new LmsService();
    await expect(
      serviceNoDb.enroll('inside-sales-ia-automacao', auth),
    ).rejects.toBeInstanceOf(ServiceUnavailableException);
  });
});
