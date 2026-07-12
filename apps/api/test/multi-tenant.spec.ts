import { Test, TestingModule } from '@nestjs/testing';
import { ForbiddenException, NotFoundException } from '@nestjs/common';
import { SubmissionStatus } from '@prisma/client';
import { LmsService } from '../src/modules/lms/lms.service';
import { PrismaService } from '../src/modules/common/prisma.service';
import { AuthContext } from '../src/modules/auth/auth.types';
import { describe, expect, it, beforeEach, vi } from 'vitest';

vi.mock('@prisma/client', async (importOriginal) => {
  const actual = await importOriginal<any>();
  return {
    ...actual,
    SubmissionStatus: {
      DRAFT: 'DRAFT',
      SUBMITTED: 'SUBMITTED',
      UNDER_REVIEW: 'UNDER_REVIEW',
      APPROVED: 'APPROVED',
      REJECTED: 'REJECTED',
      NEEDS_CHANGES: 'NEEDS_CHANGES',
    },
  };
});

describe('LmsService Multi-tenant Isolation', () => {
  let service: LmsService;
  let prisma: PrismaService;

  const mockPrisma = {
    courseVersion: {
      findFirst: vi.fn(),
    },
    enrollment: {
      findFirst: vi.fn(),
      findMany: vi.fn(),
      upsert: vi.fn(),
    },
    cycle: {
      findFirst: vi.fn(),
    },
    $transaction: vi.fn((cb) => cb(mockPrisma)),
    auditLog: {
      create: vi.fn(),
    },
    cycleCompletion: {
      findMany: vi.fn(),
      upsert: vi.fn(),
    },
    submission: {
      findMany: vi.fn(),
    },
    quizAttempt: {
      findMany: vi.fn(),
      count: vi.fn(),
      create: vi.fn(),
    },
    progressEvent: {
      create: vi.fn(),
    }
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        LmsService,
        { provide: PrismaService, useValue: mockPrisma },
      ],
    }).compile();

    service = module.get<LmsService>(LmsService);
    (service as any).prisma = mockPrisma;

    prisma = module.get<PrismaService>(PrismaService);
    vi.clearAllMocks();
  });

  const authA: AuthContext = {
    sessionId: 's-a',
    userId: 'u-a',
    name: 'User A',
    email: 'a@example.com',
    activeTenantId: 'tenant-a',
    roles: ['STUDENT'],
    memberships: [{ tenantId: 'tenant-a', role: 'STUDENT', permissions: [] }],
  };

  it('enroll should only find course versions in the active tenant', async () => {
    mockPrisma.courseVersion.findFirst.mockResolvedValue(null);

    await expect(service.enroll('course-1', authA)).rejects.toThrow(NotFoundException);

    expect(mockPrisma.courseVersion.findFirst).toHaveBeenCalledWith(expect.objectContaining({
      where: expect.objectContaining({
        tenantId: authA.activeTenantId
      })
    }));
  });

  it('getProgress should only use data from the active tenant', async () => {
    mockPrisma.cycleCompletion.findMany.mockResolvedValue([]);
    mockPrisma.submission.findMany.mockResolvedValue([]);
    mockPrisma.quizAttempt.findMany.mockResolvedValue([]);

    await service.getProgress(authA);

    expect(mockPrisma.cycleCompletion.findMany).toHaveBeenCalledWith(expect.objectContaining({
      where: expect.objectContaining({
        tenantId: authA.activeTenantId,
        userId: authA.userId
      })
    }));
    expect(mockPrisma.submission.findMany).toHaveBeenCalledWith(expect.objectContaining({
      where: expect.objectContaining({
        tenantId: authA.activeTenantId,
        userId: authA.userId
      })
    }));
  });

  it('completeCycle should only find cycles in the active tenant', async () => {
    mockPrisma.cycle.findFirst.mockResolvedValue(null);

    await expect(service.completeCycle('cycle-1', authA)).rejects.toThrow(NotFoundException);

    expect(mockPrisma.cycle.findFirst).toHaveBeenCalledWith(expect.objectContaining({
      where: expect.objectContaining({
        tenantId: authA.activeTenantId
      })
    }));
  });
});
