import { describe, expect, it } from 'vitest';
import { courseData, drawQuizQuestions, flattenCycles, isCycleUnlocked, canIssueCertificate, automationTemplateData, validateAutomationFlow } from '../src';

describe('course rules', () => {
  it('keeps the required national course shape', () => {
    expect(courseData.modules).toHaveLength(7);
    expect(flattenCycles()).toHaveLength(37);
  });

  it('draws exactly ten questions with the required difficulty mix', () => {
    const drawn = drawQuizQuestions('6.1', 'student-1-attempt-1');
    expect(drawn).toHaveLength(10);
    expect(drawn.filter((question) => question.difficulty === 'easy')).toHaveLength(3);
    expect(drawn.filter((question) => question.difficulty === 'medium')).toHaveLength(5);
    expect(drawn.filter((question) => question.difficulty === 'advanced')).toHaveLength(2);
  });

  it('blocks URL skipping when the previous cycle is incomplete', () => {
    expect(isCycleUnlocked('1.2', { completedCycles: [], submittedActivities: [], passedQuizzes: [], projectScores: {}, averageScore: 0 })).toBe(false);
  });

  it('releases certificate only when all persisted rules are met', () => {
    const cycles = flattenCycles();
    const complete = {
      completedCycles: cycles.map((cycle) => cycle.code),
      submittedActivities: cycles.map((cycle) => cycle.activity.id),
      passedQuizzes: cycles.map((cycle) => cycle.quiz.id),
      projectScores: { 'project-module-6': 90, 'project-module-7': 91 },
      finalChallengeScore: 88,
      averageScore: 86,
    };
    expect(canIssueCertificate(complete).ok).toBe(true);
    expect(canIssueCertificate({ ...complete, finalChallengeScore: 60 }).ok).toBe(false);
  });

  it('keeps automation templates in simulated and validated mode', () => {
    expect(automationTemplateData).toHaveLength(20);
    for (const template of automationTemplateData) {
      expect(validateAutomationFlow(template).valid).toBe(true);
    }
  });
});
