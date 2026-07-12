import { Prisma, PrismaClient, RoleCode } from '@prisma/client';
import {
  automationTemplateData,
  courseData,
  excellenceCompetencies,
  excellenceItems,
  promptTemplateData,
  questionData,
} from '@inside/content';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();
const tenantId = 'default';
const courseVersionId = `${courseData.id}@${courseData.version}`;
const json = (value: unknown) => value as Prisma.InputJsonValue;

async function seedIdentity() {
  const organization = await prisma.organization.upsert({
    where: { tenantId },
    update: { name: 'Organização Demonstrativa', slug: 'default', deletedAt: null },
    create: { id: 'org-default', tenantId, name: 'Organização Demonstrativa', slug: 'default' },
  });
  const roleDefinitions: Array<{ code: RoleCode; permissions: string[] }> = [
    { code: 'OWNER', permissions: ['*'] },
    { code: 'ADMIN', permissions: ['users:manage', 'submissions:review', 'certificates:revoke', 'audit:read'] },
    { code: 'INSTRUCTOR', permissions: ['course:manage', 'submissions:read'] },
    { code: 'EVALUATOR', permissions: ['submissions:review'] },
    { code: 'STUDENT', permissions: ['course:learn', 'submissions:create', 'certificates:issue'] },
  ];
  const roles = new Map<RoleCode, string>();
  for (const definition of roleDefinitions) {
    const role = await prisma.role.upsert({
      where: { tenantId_code: { tenantId, code: definition.code } },
      update: { permissions: definition.permissions, name: definition.code },
      create: { tenantId, code: definition.code, name: definition.code, permissions: definition.permissions },
    });
    roles.set(definition.code, role.id);
  }
  const passwordHash = await bcrypt.hash('InsideSales#2026', 12);
  const users: Array<{ id: string; name: string; email: string; role: RoleCode }> = [
    { id: 'user-admin', name: 'Admin Inside Sales', email: 'admin@inside.local', role: 'ADMIN' },
    { id: 'user-evaluator', name: 'Avaliador Inside Sales', email: 'avaliador@inside.local', role: 'EVALUATOR' },
    { id: 'user-student', name: 'Aluno Demonstração', email: 'aluno@inside.local', role: 'STUDENT' },
  ];
  for (const definition of users) {
    const user = await prisma.user.upsert({
      where: { email: definition.email },
      update: { name: definition.name, passwordHash, deletedAt: null },
      create: { id: definition.id, tenantId, name: definition.name, email: definition.email, passwordHash },
    });
    await prisma.membership.upsert({
      where: { userId_organizationId: { userId: user.id, organizationId: organization.id } },
      update: { tenantId, roleId: roles.get(definition.role)! },
      create: { tenantId, userId: user.id, organizationId: organization.id, roleId: roles.get(definition.role)! },
    });
  }
}

async function seedIsolationTenant() {
  const isolatedTenantId = 'isolated';
  const organization = await prisma.organization.upsert({
    where: { tenantId: isolatedTenantId },
    update: { deletedAt: null },
    create: { id: 'org-isolated', tenantId: isolatedTenantId, name: 'Tenant Isolado', slug: 'isolated' },
  });
  const role = await prisma.role.upsert({
    where: { tenantId_code: { tenantId: isolatedTenantId, code: 'STUDENT' } },
    update: {},
    create: { tenantId: isolatedTenantId, code: 'STUDENT', name: 'STUDENT', permissions: ['course:learn'] },
  });
  const user = await prisma.user.upsert({
    where: { email: 'isolated@inside.local' },
    update: { passwordHash: await bcrypt.hash('InsideSales#2026', 12), deletedAt: null },
    create: {
      id: 'user-isolated',
      tenantId: isolatedTenantId,
      name: 'Aluno Tenant Isolado',
      email: 'isolated@inside.local',
      passwordHash: await bcrypt.hash('InsideSales#2026', 12),
    },
  });
  await prisma.membership.upsert({
    where: { userId_organizationId: { userId: user.id, organizationId: organization.id } },
    update: { tenantId: isolatedTenantId, roleId: role.id },
    create: { tenantId: isolatedTenantId, userId: user.id, organizationId: organization.id, roleId: role.id },
  });
}

async function seedCourse() {
  await prisma.course.upsert({
    where: { tenantId_slug: { tenantId, slug: courseData.id } },
    update: { title: courseData.title, language: courseData.language, deletedAt: null },
    create: { id: courseData.id, tenantId, title: courseData.title, slug: courseData.id, language: courseData.language },
  });
  await prisma.courseVersion.upsert({
    where: { tenantId_courseId_version: { tenantId, courseId: courseData.id, version: courseData.version } },
    update: { status: 'published', metadata: json({ estimatedHours: courseData.estimatedHours }) },
    create: {
      id: courseVersionId,
      tenantId,
      courseId: courseData.id,
      version: courseData.version,
      status: 'published',
      metadata: json({ estimatedHours: courseData.estimatedHours }),
    },
  });

  for (const module of courseData.modules) {
    await prisma.module.upsert({
      where: { id: module.id },
      update: { title: module.title, sortOrder: module.order, courseVersionId },
      create: {
        id: module.id,
        tenantId,
        courseVersionId,
        code: module.code,
        title: module.title,
        sortOrder: module.order,
      },
    });
    for (const cycle of module.cycles) {
      await prisma.cycle.upsert({
        where: { id: cycle.id },
        update: { title: cycle.title, content: json(cycle), sortOrder: cycle.order, moduleId: module.id },
        create: {
          id: cycle.id,
          tenantId,
          moduleId: module.id,
          code: cycle.code,
          title: cycle.title,
          content: json(cycle),
          sortOrder: cycle.order,
        },
      });
      for (const [index, block] of cycle.lessonBlocks.entries()) {
        await prisma.lessonBlock.upsert({
          where: { id: block.id },
          update: { title: block.title, kind: block.kind, body: block.body, sortOrder: index },
          create: { id: block.id, tenantId, cycleId: cycle.id, title: block.title, kind: block.kind, body: block.body, sortOrder: index },
        });
      }
      await prisma.activity.upsert({
        where: { id: cycle.activity.id },
        update: { title: cycle.activity.title, content: json(cycle.activity), cycleId: cycle.id },
        create: { id: cycle.activity.id, tenantId, cycleId: cycle.id, title: cycle.activity.title, content: json(cycle.activity) },
      });
      const rubricId = `rubric-${cycle.activity.id}`;
      await prisma.rubric.upsert({
        where: { id: rubricId },
        update: { title: `Rubrica: ${cycle.activity.title}` },
        create: { id: rubricId, tenantId, ownerType: 'activity', ownerId: cycle.activity.id, title: `Rubrica: ${cycle.activity.title}` },
      });
      for (const [index, criterion] of cycle.activity.rubric.entries()) {
        await prisma.rubricCriterion.upsert({
          where: { id: `${rubricId}-${index}` },
          update: { title: criterion.criterion, levels: json(criterion.levels), sortOrder: index },
          create: { id: `${rubricId}-${index}`, tenantId, rubricId, title: criterion.criterion, levels: json(criterion.levels), sortOrder: index },
        });
      }
    }
  }

  for (const project of courseData.projects) {
    const module = courseData.modules.find(({ code }) => code === project.moduleCode);
    if (!module) continue;
    await prisma.project.upsert({
      where: { id: project.id },
      update: { moduleId: module.id, title: project.title, content: json(project) },
      create: { id: project.id, tenantId, moduleId: module.id, title: project.title, content: json(project) },
    });
  }
  await prisma.finalChallenge.upsert({
    where: { id: courseData.finalChallenge.id },
    update: { title: courseData.finalChallenge.title, content: json(courseData.finalChallenge) },
    create: {
      id: courseData.finalChallenge.id,
      tenantId,
      courseId: courseData.id,
      title: courseData.finalChallenge.title,
      content: json(courseData.finalChallenge),
    },
  });
}

async function seedQuestions() {
  const cycleIds = new Map(courseData.modules.flatMap(({ cycles }) => cycles.map((cycle) => [cycle.code, cycle.id])));
  for (const question of questionData) {
    const cycleId = cycleIds.get(question.cycleCode);
    if (!cycleId) continue;
    await prisma.question.upsert({
      where: { id: question.id },
      update: {
        cycleId,
        difficulty: question.difficulty,
        prompt: question.prompt,
        explanation: question.explanation,
        theme: question.theme,
        source: question.source,
      },
      create: {
        id: question.id,
        tenantId,
        cycleId,
        difficulty: question.difficulty,
        prompt: question.prompt,
        explanation: question.explanation,
        theme: question.theme,
        source: question.source,
      },
    });
    for (const [index, option] of question.options.entries()) {
      await prisma.questionOption.upsert({
        where: { id: option.id },
        update: { questionId: question.id, text: option.text, feedback: option.feedback, label: String.fromCharCode(65 + index) },
        create: {
          id: option.id,
          tenantId,
          questionId: question.id,
          label: String.fromCharCode(65 + index),
          text: option.text,
          feedback: option.feedback,
        },
      });
    }
    await prisma.question.update({ where: { id: question.id }, data: { correctOptionId: question.correctOptionId } });
  }
}

async function seedTemplates() {
  for (const template of automationTemplateData) {
    await prisma.automationTemplate.upsert({
      where: { id: template.id },
      update: { title: template.title, content: json(template) },
      create: { id: template.id, tenantId, title: template.title, content: json(template) },
    });
  }
  for (const prompt of promptTemplateData) {
    await prisma.promptTemplate.upsert({
      where: { id: prompt.id },
      update: { title: prompt.title, template: prompt.template, metadata: json(prompt) },
      create: { id: prompt.id, tenantId, title: prompt.title, template: prompt.template, metadata: json(prompt) },
    });
  }
}

async function seedExcellenceCatalog(tenantIdToSeed: string) {
  for (const item of excellenceItems) {
    const itemNumber = String(item.number);
    await prisma.excellenceItem.upsert({
      where: { tenantId_number: { tenantId: tenantIdToSeed, number: itemNumber } },
      update: {
        slug: item.slug,
        title: item.title,
        category: item.category,
        priority: item.priority,
        status: item.priority === 'P1.5' ? 'implementation_ready' : 'planned',
        outcomes: json([`Excelência operacional para ${item.title}`]),
        metrics: json(['adoção', 'qualidade', 'segurança', 'impacto no aluno']),
        acceptanceCriteria: json([
          'tenant derivado da sessão quando autenticado',
          'auditoria registrada em mutações protegidas',
          'documentação e testes associados',
        ]),
      },
      create: {
        id: `${tenantIdToSeed}-excellence-${item.number}`,
        tenantId: tenantIdToSeed,
        number: itemNumber,
        slug: item.slug,
        title: item.title,
        category: item.category,
        priority: item.priority,
        status: item.priority === 'P1.5' ? 'implementation_ready' : 'planned',
        outcomes: json([`Excelência operacional para ${item.title}`]),
        metrics: json(['adoção', 'qualidade', 'segurança', 'impacto no aluno']),
        acceptanceCriteria: json([
          'tenant derivado da sessão quando autenticado',
          'auditoria registrada em mutações protegidas',
          'documentação e testes associados',
        ]),
      },
    });
  }

  for (const competency of excellenceCompetencies) {
    await prisma.competency.upsert({
      where: { tenantId_code: { tenantId: tenantIdToSeed, code: competency.id } },
      update: {
        courseId: courseData.id,
        title: competency.title,
        description: competency.description,
        level: competency.level,
        evidence: json(competency.evidence),
        relatedCycles: json(competency.relatedCycles),
      },
      create: {
        id: `${tenantIdToSeed}-competency-${competency.id}`,
        tenantId: tenantIdToSeed,
        code: competency.id,
        courseId: courseData.id,
        title: competency.title,
        description: competency.description,
        level: competency.level,
        evidence: json(competency.evidence),
        relatedCycles: json(competency.relatedCycles),
      },
    });
  }
}

async function main() {
  await seedIdentity();
  await seedIsolationTenant();
  await seedCourse();
  await seedQuestions();
  await seedTemplates();
  await seedExcellenceCatalog(tenantId);
  await seedExcellenceCatalog('isolated');
  console.log(`Seed ready: 3 users, ${courseData.modules.length} modules, ${questionData.length} questions`);
}

main()
  .catch((error: unknown) => {
    console.error(error);
    process.exitCode = 1;
  })
  .finally(async () => prisma.$disconnect());
