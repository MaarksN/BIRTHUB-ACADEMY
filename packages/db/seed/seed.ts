import { Prisma, PrismaClient } from '@prisma/client';
import { automationTemplateData, courseData, promptTemplateData, questionData } from '@inside/content';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();
const tenantId = 'default';

async function main() {
  await prisma.organization.upsert({
    where: { tenantId },
    update: {},
    create: { tenantId, name: 'Organização Demonstrativa', slug: 'default' },
  });

  const passwordHash = await bcrypt.hash('InsideSales#2026', 12);
  await prisma.user.upsert({
    where: { email: 'admin@inside.local' },
    update: { passwordHash },
    create: { tenantId, name: 'Admin Inside Sales', email: 'admin@inside.local', passwordHash },
  });

  await prisma.course.upsert({
    where: { tenantId_slug: { tenantId, slug: courseData.id } },
    update: { title: courseData.title, language: courseData.language },
    create: { id: courseData.id, tenantId, title: courseData.title, slug: courseData.id, language: courseData.language },
  });

  for (const template of automationTemplateData) {
    await prisma.automationTemplate.upsert({
      where: { id: template.id },
              update: { title: template.title, content: template as unknown as Prisma.InputJsonValue },
              create: { id: template.id, tenantId, title: template.title, content: template as unknown as Prisma.InputJsonValue },
    });
  }

  for (const prompt of promptTemplateData) {
    await prisma.promptTemplate.upsert({
      where: { id: prompt.id },
              update: { title: prompt.title, template: prompt.template, metadata: prompt as unknown as Prisma.InputJsonValue },
              create: { id: prompt.id, tenantId, title: prompt.title, template: prompt.template, metadata: prompt as unknown as Prisma.InputJsonValue },
    });
  }

  console.log(`Seed ready: ${courseData.modules.length} modules, ${questionData.length} questions`);
}

main()
  .finally(async () => {
    await prisma.$disconnect();
  })
  .catch(async (error) => {
    console.error(error);
    await prisma.$disconnect();
    process.exit(1);
  });
