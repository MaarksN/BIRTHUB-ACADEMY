import { z } from 'zod';

export const excellencePrioritySchema = z.enum(['P0', 'P1', 'P1.5', 'P2', 'P3']);

export const excellenceCategorySchema = z.enum([
  'auth',
  'tenancy',
  'data-model',
  'lms-core',
  'quiz',
  'submissions',
  'certificates',
  'frontend-api',
  'ai-automation',
  'production-readiness',
  'pedagogy',
  'adaptive-learning',
  'ai-tutor',
  'assessment-integrity',
  'learner-experience',
  'community',
  'mentorship',
  'career',
  'credentials',
  'accessibility',
  'mobile',
  'analytics',
  'content-quality',
  'cms',
  'b2b',
  'integrations',
  'support',
  'governance',
  'internationalization',
  'security',
  'growth',
  'labs',
]);

export const excellenceItemSchema = z.object({
  number: z.string().regex(/^\d+$/),
  title: z.string().min(5),
  slug: z.string().min(3),
  category: excellenceCategorySchema,
  priority: excellencePrioritySchema,
});

export const competencySchema = z.object({
  id: z.string().min(3),
  title: z.string().min(3),
  description: z.string().min(10),
  level: z.enum(['foundation', 'intermediate', 'advanced', 'mastery']),
  evidence: z.array(z.string().min(3)).min(1),
  relatedCycles: z.array(z.string()).default([]),
});

export const learningPlanRequestSchema = z.object({
  goal: z.string().min(5).max(300),
  weeklyHours: z.number().int().min(1).max(40),
  currentLevel: z.enum(['beginner', 'intermediate', 'advanced']).default('beginner'),
  targetDate: z.string().datetime().optional(),
  focusCompetencies: z.array(z.string().min(3)).default([]),
});

export const aiTutorRequestSchema = z.object({
  mode: z.enum(['explain', 'socratic', 'practice', 'roleplay', 'review', 'career']),
  cycleCode: z.string().optional(),
  prompt: z.string().min(10).max(5000),
  allowAssessmentAnswer: z.boolean().default(false),
  consentToStore: z.boolean().default(false),
});

export const qualityScoreRequestSchema = z.object({
  courseId: z.string().min(1),
  pedagogicalAlignment: z.number().min(0).max(100),
  assessmentQuality: z.number().min(0).max(100),
  accessibility: z.number().min(0).max(100),
  learnerExperience: z.number().min(0).max(100),
  careerImpact: z.number().min(0).max(100),
  contentFreshness: z.number().min(0).max(100),
});

export const portfolioProfileSchema = z.object({
  displayName: z.string().min(2).max(120),
  headline: z.string().min(5).max(180),
  bio: z.string().max(1000).default(''),
  publicSlug: z.string().regex(/^[a-z0-9-]{3,80}$/),
  visibleBadges: z.array(z.string()).default([]),
  visibleProjects: z.array(z.string()).default([]),
});

export const supportTicketSchema = z.object({
  category: z.enum(['technical', 'course', 'certificate', 'billing', 'career', 'community']),
  subject: z.string().min(5).max(160),
  description: z.string().min(10).max(5000),
  severity: z.enum(['low', 'normal', 'high', 'critical']).default('normal'),
});

export type ExcellenceItemInput = z.infer<typeof excellenceItemSchema>;
export type CompetencyInput = z.infer<typeof competencySchema>;
export type LearningPlanRequest = z.infer<typeof learningPlanRequestSchema>;
export type AiTutorRequest = z.infer<typeof aiTutorRequestSchema>;
export type QualityScoreRequest = z.infer<typeof qualityScoreRequestSchema>;
export type PortfolioProfileInput = z.infer<typeof portfolioProfileSchema>;
export type SupportTicketInput = z.infer<typeof supportTicketSchema>;
