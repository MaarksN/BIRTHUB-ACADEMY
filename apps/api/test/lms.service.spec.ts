import { describe, expect, it } from 'vitest';
import { LmsService } from '../src/modules/lms/lms.service';

describe('LmsService', () => {
  const service = new LmsService();

  it('returns course data', () => {
    expect(service.getCourse().modules).toHaveLength(7);
  });

  it('rejects a locked quiz start', () => {
    expect(() =>
      service.startQuiz('1.2', 'attempt-seed', {
        completedCycles: [],
        submittedActivities: [],
        passedQuizzes: [],
        projectScores: {},
        averageScore: 0,
      }),
    ).toThrow();
  });

  it('validates progress events even without a database connection', async () => {
    await expect(
      service.recordProgressEvent({
        tenantId: 'default',
        userId: 'user-student',
        cycleCode: '1.1',
        eventType: 'cycle_completed',
        metadata: {},
      }),
    ).resolves.toMatchObject({ persisted: false });
  });
});
