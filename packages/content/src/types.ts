export type Difficulty = 'easy' | 'medium' | 'advanced';

export interface RubricLevel {
  level: number;
  label: string;
  description: string;
}

export interface RubricCriterion {
  criterion: string;
  levels: RubricLevel[];
}

export interface Activity {
  id: string;
  title: string;
  objective: string;
  context: string;
  instructions: string[];
  deliveryFields: string[];
  allowedExamples: string[];
  rubric: RubricCriterion[];
  reviewStatus: string;
  exportable: boolean;
}

export interface LessonBlock {
  id: string;
  title: string;
  kind: string;
  body: string;
}

export interface Cycle {
  id: string;
  code: string;
  moduleCode: string;
  order: number;
  title: string;
  description: string;
  objectives: string[];
  competencies: string[];
  prerequisites: string[];
  estimatedMinutes: number;
  level: string;
  intro: string;
  lessonBlocks: LessonBlock[];
  keyTerms: Array<{ term: string; definition: string }>;
  examples: string[];
  caseStudy: { label: string; title: string; body: string };
  visualModel: { title: string; markdown: string };
  commonMistakes: string[];
  bestPractices: string[];
  checklist: string[];
  summary: string;
  glossary: Array<{ term: string; definition: string }>;
  activity: Activity;
  quiz: {
    id: string;
    questionBankSize: number;
    questionsPerAttempt: number;
    difficultyMix: Record<Difficulty, number>;
    passingScore: number;
  };
  recoveryThemes: Array<{ theme: string; instruction: string }>;
  references: Array<{ sourceFile: string; type: string; priority: string }>;
  unlockCondition: string;
}

export interface CourseModule {
  id: string;
  code: string;
  title: string;
  order: number;
  cycles: Cycle[];
}

export interface Course {
  id: string;
  title: string;
  version: string;
  language: string;
  estimatedHours: number;
  institution: string;
  responsible: string;
  generatedAt: string;
  modules: CourseModule[];
  projects: Array<{ id: string; moduleCode: string; title: string; requiredFields: string[]; rubric: RubricCriterion[]; passingScore: number }>;
  finalChallenge: { id: string; title: string; parts: string[]; rubricCriteria: string[]; passingScore: number; source: string };
  certificateRules: {
    requiredCyclesCompleted: number;
    requiredActivitiesSubmitted: number;
    requiredQuizzesPassed: number;
    requiredProjects: string[];
    requiredFinalChallengeApproved: boolean;
    minimumAverage: number;
  };
  gamification: { cycleXp: number; activityXp: number; quizPassXp: number; projectXp: number; levels: string[] };
}

export interface QuestionOption {
  id: string;
  text: string;
  feedback: string;
}

export interface Question {
  id: string;
  cycleCode: string;
  difficulty: Difficulty;
  type: 'multiple_choice' | 'true_false';
  theme: string;
  prompt: string;
  options: QuestionOption[];
  correctOptionId: string;
  explanation: string;
  referenceBlockId: string;
  source: string;
}

export interface LearnerProgress {
  completedCycles: string[];
  submittedActivities: string[];
  passedQuizzes: string[];
  projectScores: Record<string, number>;
  finalChallengeScore?: number;
  averageScore: number;
}

export interface AutomationTemplate {
  id: string;
  title: string;
  mode: string;
  trigger: string;
  conditions: string[];
  actions: Array<{ type: string; label: string }>;
  delays: string[];
  fallbacks: string[];
  errorHandling: string[];
  metrics: string[];
}

export interface PromptTemplate {
  id: string;
  cycleCode: string;
  title: string;
  mode: string;
  template: string;
  qualityCriteria: string[];
}
