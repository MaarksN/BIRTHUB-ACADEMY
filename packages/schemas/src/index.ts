import { z } from 'zod';

export const loginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(8),
  tenantSlug: z.string().min(2).default('default'),
});

export const progressEventSchema = z.object({
  tenantId: z.string().min(1),
  userId: z.string().min(1),
  cycleCode: z.string().regex(/^\d+\.\d+$/),
  eventType: z.enum(['cycle_completed', 'activity_submitted', 'quiz_passed', 'project_submitted', 'certificate_requested']),
  metadata: z.record(z.unknown()).default({}),
});

export const quizStartSchema = z.object({
  tenantId: z.string().min(1),
  userId: z.string().min(1),
  cycleCode: z.string().regex(/^\d+\.\d+$/),
  attemptSeed: z.string().min(8),
});

export const aiLabRequestSchema = z.object({
  tenantId: z.string().min(1),
  userId: z.string().min(1),
  mode: z.enum(['simulated', 'provider']),
  prompt: z.string().min(20).max(5000),
  consentToStore: z.boolean().default(false),
});

export const automationFlowSchema = z.object({
  tenantId: z.string().min(1),
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
  status: z.enum(['submitted', 'approved', 'rejected', 'pending_review']),
  score: z.number().min(0).max(100).optional(),
  note: z.string().optional(),
});

export type LoginInput = z.infer<typeof loginSchema>;
export type UpdateUserRoleInput = z.infer<typeof updateUserRoleSchema>;
export type ReviewSubmissionInput = z.infer<typeof reviewSubmissionSchema>;
export type ProgressEventInput = z.infer<typeof progressEventSchema>;
export type QuizStartInput = z.infer<typeof quizStartSchema>;
export type AiLabRequestInput = z.infer<typeof aiLabRequestSchema>;
export type AutomationFlowInput = z.infer<typeof automationFlowSchema>;
