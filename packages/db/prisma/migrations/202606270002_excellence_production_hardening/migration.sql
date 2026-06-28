-- Excellence 35 production hardening.
-- Promotes the ZIP overlay data from static code/docs to tenant-scoped persistence.

CREATE TABLE "ExcellenceItem" (
    "id" TEXT NOT NULL,
    "tenantId" TEXT NOT NULL,
    "number" INTEGER NOT NULL,
    "slug" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "category" TEXT NOT NULL,
    "priority" TEXT NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'planned',
    "outcomes" JSONB NOT NULL DEFAULT '[]',
    "metrics" JSONB NOT NULL DEFAULT '[]',
    "acceptanceCriteria" JSONB NOT NULL DEFAULT '[]',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "ExcellenceItem_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "Competency" (
    "id" TEXT NOT NULL,
    "tenantId" TEXT NOT NULL,
    "code" TEXT NOT NULL,
    "courseId" TEXT,
    "title" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "level" TEXT NOT NULL,
    "evidence" JSONB NOT NULL DEFAULT '[]',
    "relatedCycles" JSONB NOT NULL DEFAULT '[]',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Competency_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "LearningPlan" (
    "id" TEXT NOT NULL,
    "tenantId" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "goal" TEXT NOT NULL,
    "weeklyHours" INTEGER NOT NULL,
    "currentLevel" TEXT NOT NULL,
    "targetDate" TIMESTAMP(3),
    "intensity" TEXT NOT NULL,
    "focusCompetencies" JSONB NOT NULL DEFAULT '[]',
    "milestones" JSONB NOT NULL DEFAULT '[]',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "LearningPlan_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "TutorInteraction" (
    "id" TEXT NOT NULL,
    "tenantId" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "mode" TEXT NOT NULL,
    "cycleCode" TEXT,
    "promptHash" TEXT NOT NULL,
    "redactedPrompt" TEXT NOT NULL,
    "answer" TEXT,
    "nextQuestions" JSONB NOT NULL DEFAULT '[]',
    "riskFlags" JSONB NOT NULL DEFAULT '[]',
    "consentToStore" BOOLEAN NOT NULL DEFAULT false,
    "provider" TEXT NOT NULL DEFAULT 'local',
    "fallbackUsed" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "TutorInteraction_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "CourseQualityScore" (
    "id" TEXT NOT NULL,
    "tenantId" TEXT NOT NULL,
    "courseId" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "score" INTEGER NOT NULL,
    "status" TEXT NOT NULL,
    "details" JSONB NOT NULL DEFAULT '{}',
    "recommendations" JSONB NOT NULL DEFAULT '[]',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "CourseQualityScore_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "SupportTicket" (
    "id" TEXT NOT NULL,
    "tenantId" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "category" TEXT NOT NULL,
    "subject" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "severity" TEXT NOT NULL DEFAULT 'normal',
    "status" TEXT NOT NULL DEFAULT 'open',
    "sla" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "closedAt" TIMESTAMP(3),

    CONSTRAINT "SupportTicket_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX "ExcellenceItem_tenantId_number_key" ON "ExcellenceItem"("tenantId", "number");
CREATE UNIQUE INDEX "ExcellenceItem_tenantId_slug_key" ON "ExcellenceItem"("tenantId", "slug");
CREATE INDEX "ExcellenceItem_tenantId_priority_idx" ON "ExcellenceItem"("tenantId", "priority");
CREATE INDEX "ExcellenceItem_tenantId_category_idx" ON "ExcellenceItem"("tenantId", "category");

CREATE UNIQUE INDEX "Competency_tenantId_code_key" ON "Competency"("tenantId", "code");
CREATE INDEX "Competency_tenantId_level_idx" ON "Competency"("tenantId", "level");
CREATE INDEX "Competency_tenantId_courseId_idx" ON "Competency"("tenantId", "courseId");

CREATE INDEX "LearningPlan_tenantId_userId_createdAt_idx" ON "LearningPlan"("tenantId", "userId", "createdAt");
CREATE INDEX "LearningPlan_tenantId_currentLevel_idx" ON "LearningPlan"("tenantId", "currentLevel");

CREATE INDEX "TutorInteraction_tenantId_userId_createdAt_idx" ON "TutorInteraction"("tenantId", "userId", "createdAt");
CREATE INDEX "TutorInteraction_tenantId_mode_createdAt_idx" ON "TutorInteraction"("tenantId", "mode", "createdAt");

CREATE INDEX "CourseQualityScore_tenantId_courseId_createdAt_idx" ON "CourseQualityScore"("tenantId", "courseId", "createdAt");
CREATE INDEX "CourseQualityScore_tenantId_userId_createdAt_idx" ON "CourseQualityScore"("tenantId", "userId", "createdAt");
CREATE INDEX "CourseQualityScore_tenantId_score_idx" ON "CourseQualityScore"("tenantId", "score");

CREATE INDEX "SupportTicket_tenantId_userId_status_idx" ON "SupportTicket"("tenantId", "userId", "status");
CREATE INDEX "SupportTicket_tenantId_severity_createdAt_idx" ON "SupportTicket"("tenantId", "severity", "createdAt");

ALTER TABLE "ExcellenceItem" ADD CONSTRAINT "ExcellenceItem_tenantId_fkey" FOREIGN KEY ("tenantId") REFERENCES "Organization"("tenantId") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "Competency" ADD CONSTRAINT "Competency_tenantId_fkey" FOREIGN KEY ("tenantId") REFERENCES "Organization"("tenantId") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "LearningPlan" ADD CONSTRAINT "LearningPlan_tenantId_fkey" FOREIGN KEY ("tenantId") REFERENCES "Organization"("tenantId") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "LearningPlan" ADD CONSTRAINT "LearningPlan_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "TutorInteraction" ADD CONSTRAINT "TutorInteraction_tenantId_fkey" FOREIGN KEY ("tenantId") REFERENCES "Organization"("tenantId") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "TutorInteraction" ADD CONSTRAINT "TutorInteraction_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "CourseQualityScore" ADD CONSTRAINT "CourseQualityScore_tenantId_fkey" FOREIGN KEY ("tenantId") REFERENCES "Organization"("tenantId") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "CourseQualityScore" ADD CONSTRAINT "CourseQualityScore_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "SupportTicket" ADD CONSTRAINT "SupportTicket_tenantId_fkey" FOREIGN KEY ("tenantId") REFERENCES "Organization"("tenantId") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "SupportTicket" ADD CONSTRAINT "SupportTicket_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
