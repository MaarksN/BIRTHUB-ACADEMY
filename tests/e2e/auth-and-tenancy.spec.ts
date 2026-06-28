import { expect, test } from '@playwright/test';

test('login, auth/me, dashboard and logout form a persistent session flow', async ({ page }) => {
  await page.goto('/login');
  await page.getByLabel('E-mail').fill('aluno@inside.local');
  await page.getByLabel('Senha').fill('InsideSales#2026');
  await page.getByRole('button', { name: 'Entrar' }).click();
  await expect(page).toHaveURL('/');
  await expect(page.getByText(/Painel de Aluno Demonstração/i)).toBeVisible();
  const me = await page.request.get('http://localhost:3333/auth/me');
  expect(me.ok()).toBeTruthy();
  await page.getByRole('button', { name: 'Sair' }).click();
  await expect(page).toHaveURL(/\/login(?:\?next=.*)?$/);
  expect((await page.request.get('http://localhost:3333/auth/me')).status()).toBe(401);
});

test('student cannot access admin data', async ({ page }) => {
  await page.goto('/login');
  await page.getByLabel('E-mail').fill('aluno@inside.local');
  await page.getByLabel('Senha').fill('InsideSales#2026');
  await page.getByRole('button', { name: 'Entrar' }).click();
  await expect.poll(async () => (await page.request.get('http://localhost:3333/admin/users')).status()).toBe(403);
});

test('tenant identity is derived from session and cannot access another tenant course', async ({ request }) => {
  const login = await request.post('http://localhost:3333/auth/login', {
    data: { email: 'isolated@inside.local', password: 'InsideSales#2026', tenantSlug: 'isolated' },
  });
  expect(login.ok()).toBeTruthy();
  const enrollment = await request.post('http://localhost:3333/courses/inside-sales-ia-automacao/enroll');
  expect(enrollment.status()).toBe(404);
});
