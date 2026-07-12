import { describe, expect, it } from 'vitest';
import { courseData, flattenCycles } from '@inside/content';
import { CertificateService } from '../src/modules/certificates/certificate.service';

function completeProgress() {
  const cycles = flattenCycles();
  return {
    completedCycles: cycles.map((cycle) => cycle.code),
    submittedActivities: cycles.map((cycle) => cycle.activity.id),
    passedQuizzes: cycles.map((cycle) => cycle.quiz.id),
    projectScores: { 'project-module-6': 88, 'project-module-7': 91 },
    finalChallengeScore: 90,
    averageScore: 89,
  };
}

describe('CertificateService', () => {
  const service = new CertificateService();

  it('blocks certificate issue when requirements are missing', async () => {
    await expect(
      service.issue({
        userName: 'Aluno Parcial',
        progress: { completedCycles: [], submittedActivities: [], passedQuizzes: [], projectScores: {}, averageScore: 0 },
      }),
    ).resolves.toMatchObject({ issued: false });
  });

  it('issues an eligible certificate payload with public verification URL', async () => {
    const result = await service.issue({ userName: 'Aluno Completo', progress: completeProgress() });
    expect(result).toMatchObject({ issued: true, persisted: false });
    const certificate = result.certificate;
    if (!certificate) throw new Error('certificate should be issued');
    expect(certificate.course).toBe(courseData.title);
    expect(certificate.verificationUrl).toContain('/certificates/verify/ISIA-');
  });

  it('verifies certificate-shaped codes through the fallback route', async () => {
    await expect(service.verify('ISIA-ABCDEF123456')).resolves.toMatchObject({ status: 'VALID' });
    await expect(service.verify('INVALID')).resolves.toMatchObject({ status: 'NOT_FOUND' });
  });
});
