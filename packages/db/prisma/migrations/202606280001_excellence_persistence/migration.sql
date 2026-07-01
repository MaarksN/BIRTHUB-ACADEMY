-- CreateEnum
CREATE TYPE "SupportTicketStatus" AS ENUM ('OPEN', 'IN_PROGRESS', 'RESOLVED', 'CLOSED');

-- CreateTable
CREATE TABLE "LearningPlan" (
    "id" TEXT NOT NULL,
    "tenantId" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "goal" TEXT NOT NULL,
    "weeklyHours" INTEGER NOT NULL,
    "currentLevel" TEXT NOT NULL,
    "targetDate" TIMESTAMP(3),
    "focusCompetencies" JSONB NOT NULL,
    "intensity" TEXT NOT NULL,
    "milestones" JSONB NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'active',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "LearningPlan_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "CourseQualityScore" (
    "id" TEXT NOT NULL,
    "tenantId" TEXT NOT NULL,
    "courseId" TEXT NOT NULL,
    "score" INTEGER NOT NULL,
    "status" TEXT NOT NULL,
    "details" JSONB NOT NULL,
    "recommendations" JSONB NOT NULL,
    "createdById" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "CourseQualityScore_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "SupportTicket" (
    "id" TEXT NOT NULL,
    "tenantId" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "category" TEXT NOT NULL,
    "subject" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "severity" TEXT NOT NULL,
    "status" "SupportTicketStatus" NOT NULL DEFAULT 'OPEN',
    "slaDueAt" TIMESTAMP(3) NOT NULL,
    "resolvedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "SupportTicket_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "LearningPlan_tenantId_userId_status_idx" ON "LearningPlan"("tenantId", "userId", "status");

-- CreateIndex
CREATE INDEX "LearningPlan_tenantId_createdAt_idx" ON "LearningPlan"("tenantId", "createdAt");

-- CreateIndex
CREATE INDEX "CourseQualityScore_tenantId_courseId_createdAt_idx" ON "CourseQualityScore"("tenantId", "courseId", "createdAt");

-- CreateIndex
CREATE INDEX "CourseQualityScore_tenantId_createdById_idx" ON "CourseQualityScore"("tenantId", "createdById");

-- CreateIndex
CREATE INDEX "SupportTicket_tenantId_userId_status_createdAt_idx" ON "SupportTicket"("tenantId", "userId", "status", "createdAt");

-- CreateIndex
CREATE INDEX "SupportTicket_tenantId_status_slaDueAt_idx" ON "SupportTicket"("tenantId", "status", "slaDueAt");

-- AddForeignKey
ALTER TABLE "LearningPlan" ADD CONSTRAINT "LearningPlan_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CourseQualityScore" ADD CONSTRAINT "CourseQualityScore_courseId_fkey" FOREIGN KEY ("courseId") REFERENCES "Course"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CourseQualityScore" ADD CONSTRAINT "CourseQualityScore_createdById_fkey" FOREIGN KEY ("createdById") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "SupportTicket" ADD CONSTRAINT "SupportTicket_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
