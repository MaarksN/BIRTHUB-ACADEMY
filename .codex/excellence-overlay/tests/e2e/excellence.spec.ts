import { test, expect } from '@playwright/test';

test.describe('Excellence 35 overlay', () => {
  test('exibe página de excelência com os itens complementares', async ({ page }) => {
    await page.goto('/excelencia');
    await expect(page.getByRole('heading', { name: /Plano dos 35 itens/i })).toBeVisible();
    await expect(page.getByText(/Motor pedagógico de excelência/i)).toBeVisible();
    await expect(page.getByText(/Laboratórios práticos e simulações/i)).toBeVisible();
  });

  test('API pública lista itens de excelência', async ({ request }) => {
    const response = await request.get('http://localhost:3333/excellence/items');
    expect(response.ok()).toBeTruthy();
    const body = await response.json();
    expect(body.total).toBe(25);
    expect(body.items[0].number).toBe('11');
  });
});
