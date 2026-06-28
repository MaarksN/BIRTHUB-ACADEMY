import { z } from 'zod';

export const loginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(8),
  tenantSlug: z.string().min(2).default('default'),
});

export const progressEventSchema = z.object({
  cycleCode: z.string().regex(/^\d+\.\d+$/),
  eventType: z.enum(['cycle_completed', 'activity_submitted', 'quiz_passed', 'project_submitted', 'certificate_requested']),
  metadata: z.record(z.unknown()).default({}),
});

export const quizStartSchema = z.object({
  cycleCode: z.string().regex(/^\d+\.\d+$/),
});

export const quizAnswerSchema = z.object({
  questionId: z.string().min(1),
  selectedOptionId: z.string().min(1),
});

export const submissionSchema = z.object({
  payload: z.record(z.unknown()),
  files: z.array(z.object({
    objectKey: z.string().min(3).max(500),
    originalName: z.string().min(1).max(255),
    mimeType: z.enum(['application/pdf', 'text/plain', 'image/png', 'image/jpeg']),
    sizeBytes: z.number().int().positive().max(10 * 1024 * 1024),
  })).max(5).default([]),
});

export const aiLabRequestSchema = z.object({
  mode: z.enum(['simulated', 'provider']),
  prompt: z.string().min(20).max(5000),
  consentToStore: z.boolean().default(false),
});

export const automationFlowSchema = z.object({
  title: z.string().min(3),
  mode: z.literal('[SIMULACAO]'),
  trigger: z.string().min(3),
  conditions: z.array(z.string().min(1)).min(1),
  actions: z.array(z.object({ type: z.string().min(1), label: z.string().min(1) })).min(1),
  errorHandling: z.array(z.string().min(1)).min(1),
});

export const updateUserRoleSchema = z.object({
  role: z.enum(['OWNER', 'ADMIN', 'INSTRUCTOR', 'EVALUATOR', 'STUDENT']),
});

export const reviewSubmissionSchema = z.object({
  status: z.enum(['APPROVED', 'REJECTED', 'NEEDS_CHANGES']),
  score: z.number().min(0).max(100).optional(),
  note: z.string().max(5000).optional(),
  rubricScores: z.array(z.object({
    criterionId: z.string().min(1),
    score: z.number().int().min(0).max(100),
    note: z.string().max(1000).optional(),
  })).default([]),
});

export type LoginInput = z.infer<typeof loginSchema>;
export type UpdateUserRoleInput = z.infer<typeof updateUserRoleSchema>;
export type ReviewSubmissionInput = z.infer<typeof reviewSubmissionSchema>;
export type ProgressEventInput = z.infer<typeof progressEventSchema>;
export type QuizStartInput = z.infer<typeof quizStartSchema>;
export type QuizAnswerInput = z.infer<typeof quizAnswerSchema>;
export type SubmissionInput = z.infer<typeof submissionSchema>;
export type AiLabRequestInput = z.infer<typeof aiLabRequestSchema>;
export type AutomationFlowInput = z.infer<typeof automationFlowSchema>;

export * from './excellence';
