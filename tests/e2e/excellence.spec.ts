import { test, expect } from '@playwright/test';

const apiUrl = process.env.E2E_API_URL ?? 'http://localhost:3333';

test.describe('Excellence 35 overlay', () => {
  test('exibe página de excelência com os 35 itens', async ({ page }) => {
    await page.goto('/excelencia');
    await expect(page.getByRole('heading', { name: /Plano dos 35 itens/i })).toBeVisible();
    await expect(page.getByText(/Corrigir autenticação e sessões/i)).toBeVisible();
    await expect(page.getByText(/Motor pedagógico de excelência/i)).toBeVisible();
    await expect(page.getByText(/Laboratórios práticos e simulações/i)).toBeVisible();
  });

  test('API pública lista itens de excelência', async ({ request }) => {
    const response = await request.get(`${apiUrl}/excellence/items`);
    expect(response.ok()).toBeTruthy();
    const body = await response.json();
    expect(body.total).toBe(35);
    expect(body.items[0].number).toBe('1');
  });

  test('aluno persiste plano e ticket no próprio tenant', async ({ request }) => {
    const login = await request.post(`${apiUrl}/auth/login`, {
      data: { email: 'aluno@inside.local', password: 'InsideSales#2026', tenantSlug: 'default' },
    });
    expect(login.ok()).toBeTruthy();

    const plan = await request.post(`${apiUrl}/excellence/learning-plan`, {
      data: {
        goal: 'Concluir trilha prática de prospecção',
        weeklyHours: 6,
        currentLevel: 'beginner',
        focusCompetencies: ['prospecting-execution'],
      },
    });
    expect(plan.ok()).toBeTruthy();
    const createdPlan = await plan.json();

    const plans = await request.get(`${apiUrl}/excellence/learning-plans`);
    expect(plans.ok()).toBeTruthy();
    expect((await plans.json()).some((item: { id: string }) => item.id === createdPlan.id)).toBeTruthy();

    const ticket = await request.post(`${apiUrl}/excellence/support-ticket`, {
      data: {
        category: 'course',
        subject: 'Ajuda com a rubrica',
        description: 'Preciso entender qual evidência prática atende ao critério principal.',
        severity: 'normal',
      },
    });
    expect(ticket.ok()).toBeTruthy();
    const createdTicket = await ticket.json();

    const tickets = await request.get(`${apiUrl}/excellence/support-tickets`);
    expect(tickets.ok()).toBeTruthy();
    expect((await tickets.json()).some((item: { id: string }) => item.id === createdTicket.id)).toBeTruthy();

    const qualityScore = await request.post(`${apiUrl}/excellence/quality-score`, {
      data: {
        courseId: 'inside-sales-ia-automacao',
        pedagogicalAlignment: 90,
        assessmentQuality: 80,
        accessibility: 75,
        learnerExperience: 85,
        careerImpact: 80,
        contentFreshness: 90,
      },
    });
    expect(qualityScore.status()).toBe(403);
  });
});
