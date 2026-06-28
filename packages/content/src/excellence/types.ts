export type ExcellencePriority = 'P0' | 'P1' | 'P1.5' | 'P2' | 'P3';

export type ExcellenceCategory =
  | 'auth'
  | 'tenancy'
  | 'data-model'
  | 'lms-core'
  | 'quiz'
  | 'submissions'
  | 'certificates'
  | 'frontend-api'
  | 'ai-automation'
  | 'production-readiness'
  | 'pedagogy'
  | 'adaptive-learning'
  | 'ai-tutor'
  | 'assessment-integrity'
  | 'learner-experience'
  | 'community'
  | 'mentorship'
  | 'career'
  | 'credentials'
  | 'accessibility'
  | 'mobile'
  | 'analytics'
  | 'content-quality'
  | 'cms'
  | 'b2b'
  | 'integrations'
  | 'support'
  | 'governance'
  | 'internationalization'
  | 'security'
  | 'growth'
  | 'labs';

export interface ExcellenceItem {
  number: string;
  title: string;
  slug: string;
  category: ExcellenceCategory;
  priority: ExcellencePriority;
}

export interface Competency {
  id: string;
  title: string;
  description: string;
  level: 'foundation' | 'intermediate' | 'advanced' | 'mastery';
  evidence: string[];
  relatedCycles: string[];
}

export interface ExcellencePillar {
  id: string;
  title: string;
  purpose: string;
  items: string[];
  successMetrics: string[];
}
