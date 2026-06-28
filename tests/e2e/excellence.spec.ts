import { test, expect } from '@playwright/test';

test.describe('Excellence 35 overlay', () => {
  test('exibe página de excelência com os itens complementares', async ({ page }) => {
    await page.goto('/excelencia');
    await expect(page.getByRole('heading', { name: /Plano dos 35 itens/i })).toBeVisible();
    await expect(page.getByText('11. Motor pedagógico de excelência', { exact: true })).toBeVisible();
    await expect(page.getByText('35. Laboratórios práticos e simulações', { exact: true })).toBeVisible();
  });

  test('API pública lista itens de excelência', async ({ request }) => {
    const response = await request.get('http://localhost:3333/excellence/items');
    expect(response.ok()).toBeTruthy();
    const body = await response.json();
    expect(body.total).toBe(25);
    expect(body.items[0].number).toBe('11');
    expect(body.items.at(-1).number).toBe('35');
  });

  test('endpoints protegidos exigem sessão', async ({ request }) => {
    const response = await request.post('http://localhost:3333/excellence/learning-plan', {
      data: { goal: 'Concluir laboratórios', weeklyHours: 4, currentLevel: 'beginner', focusCompetencies: [] },
    });
    expect(response.status()).toBe(401);
  });

  test('sessão cria plano, tutor, score e ticket no tenant ativo', async ({ request }) => {
    const login = await request.post('http://localhost:3333/auth/login', {
      data: { email: 'aluno@inside.local', password: 'InsideSales#2026', tenantSlug: 'default' },
    });
    expect(login.ok()).toBeTruthy();

    const plan = await request.post('http://localhost:3333/excellence/learning-plan', {
      data: {
        goal: 'Concluir o item 35 com laboratório prático',
        weeklyHours: 6,
        currentLevel: 'beginner',
        focusCompetencies: ['sales-foundation'],
        tenantId: 'malicious-client-tenant',
      },
    });
    expect(plan.ok()).toBeTruthy();
    const planBody = await plan.json();
    expect(planBody.tenantId).toBe('default');
    expect(planBody.userId).toBe('user-student');

    const tutor = await request.post('http://localhost:3333/excellence/ai-tutor', {
      data: {
        mode: 'socratic',
        cycleCode: '3.1',
        prompt: 'Como reviso meu laboratório do item 35 sem pedir resposta final?',
        consentToStore: true,
        allowAssessmentAnswer: false,
      },
    });
    expect(tutor.ok()).toBeTruthy();
    const tutorBody = await tutor.json();
    expect(tutorBody.answer).toContain('[MODO LOCAL]');
    expect(tutorBody.tenantId).toBe('default');

    const score = await request.post('http://localhost:3333/excellence/quality-score', {
      data: {
        courseId: 'inside-sales-ia-automacao',
        pedagogicalAlignment: 90,
        assessmentQuality: 84,
        accessibility: 82,
        learnerExperience: 86,
        careerImpact: 81,
        contentFreshness: 88,
      },
    });
    expect(score.ok()).toBeTruthy();
    expect((await score.json()).status).toBe('excelente');

    const ticket = await request.post('http://localhost:3333/excellence/support-ticket', {
      data: {
        category: 'technical',
        subject: 'Laboratório prático do item 35',
        description: 'Preciso de ajuda para abrir a simulação prática.',
        severity: 'normal',
      },
    });
    expect(ticket.ok()).toBeTruthy();
    expect((await ticket.json()).status).toBe('open');

    const history = await request.get('http://localhost:3333/excellence/ai-tutor/history');
    expect(history.ok()).toBeTruthy();
    expect((await history.json()).total).toBeGreaterThan(0);
  });

  test('tenant isolado não pontua curso do tenant default', async ({ request }) => {
    const login = await request.post('http://localhost:3333/auth/login', {
      data: { email: 'isolated@inside.local', password: 'InsideSales#2026', tenantSlug: 'isolated' },
    });
    expect(login.ok()).toBeTruthy();
    const response = await request.post('http://localhost:3333/excellence/quality-score', {
      data: {
        courseId: 'inside-sales-ia-automacao',
        pedagogicalAlignment: 90,
        assessmentQuality: 84,
        accessibility: 82,
        learnerExperience: 86,
        careerImpact: 81,
        contentFreshness: 88,
      },
    });
    expect(response.status()).toBe(404);
  });
});
