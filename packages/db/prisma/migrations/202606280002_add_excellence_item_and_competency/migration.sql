-- CreateTable
CREATE TABLE "ExcellenceItem" (
    "id" TEXT NOT NULL,
    "tenantId" TEXT NOT NULL,
    "number" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "category" TEXT NOT NULL,
    "priority" TEXT NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'backlog',
    "outcomes" JSONB NOT NULL DEFAULT '[]',
    "metrics" JSONB NOT NULL DEFAULT '[]',
    "acceptanceCriteria" JSONB NOT NULL DEFAULT '[]',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "ExcellenceItem_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Competency" (
    "id" TEXT NOT NULL,
    "tenantId" TEXT NOT NULL,
    "code" TEXT NOT NULL,
    "courseId" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "level" TEXT NOT NULL,
    "evidence" JSONB NOT NULL DEFAULT '[]',
    "relatedCycles" JSONB NOT NULL DEFAULT '[]',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Competency_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "ExcellenceItem_tenantId_idx" ON "ExcellenceItem"("tenantId");

-- CreateIndex
CREATE UNIQUE INDEX "ExcellenceItem_tenantId_slug_key" ON "ExcellenceItem"("tenantId", "slug");

-- CreateIndex
CREATE UNIQUE INDEX "ExcellenceItem_tenantId_number_key" ON "ExcellenceItem"("tenantId", "number");

-- CreateIndex
CREATE UNIQUE INDEX "Competency_tenantId_code_key" ON "Competency"("tenantId", "code");

-- CreateIndex
CREATE INDEX "Competency_tenantId_courseId_idx" ON "Competency"("tenantId", "courseId");

-- AddForeignKey
ALTER TABLE "Competency" ADD CONSTRAINT "Competency_courseId_fkey" FOREIGN KEY ("courseId") REFERENCES "Course"("id") ON DELETE CASCADE ON UPDATE CASCADE;
