import { defineConfig, devices } from '@playwright/test';

const webUrl = process.env.E2E_WEB_URL ?? 'http://localhost:3000';
const apiUrl = process.env.E2E_API_URL ?? 'http://localhost:3333';
const databaseUrl =
  process.env.E2E_DATABASE_URL ??
  process.env.DATABASE_URL ??
  'postgresql://inside:inside@localhost:55432/inside_sales_test?schema=public';
const webPort = new URL(webUrl).port || '3000';
const apiPort = new URL(apiUrl).port || '3333';

export default defineConfig({
  testDir: './tests/e2e',
  timeout: 30_000,
  fullyParallel: false,
  retries: process.env.CI ? 2 : 0,
  reporter: [['list'], ['html', { open: 'never' }]],
  use: {
    baseURL: webUrl,
    trace: 'retain-on-failure',
  },
  projects: [{ name: 'chromium', use: { ...devices['Desktop Chrome'] } }],
  webServer: [
    {
      command:
        'pnpm --filter @inside/db exec prisma migrate deploy --schema prisma/schema.prisma && ' +
        'pnpm --filter @inside/db seed && pnpm --filter @inside/api dev',
      url: `${apiUrl}/health`,
      reuseExistingServer: !process.env.CI,
      timeout: 120_000,
      env: {
        ...process.env,
        PORT: apiPort,
        WEB_ORIGIN: webUrl,
        DATABASE_URL: databaseUrl,
      },
    },
    {
      command:
        'pnpm --filter @inside/content build && pnpm --filter @inside/ui build && ' +
        `pnpm --filter @inside/web build && pnpm --filter @inside/web exec next start --port ${webPort}`,
      url: `${webUrl}/login`,
      reuseExistingServer: !process.env.CI,
      timeout: 180_000,
      env: { ...process.env, NEXT_PUBLIC_API_URL: apiUrl },
    },
  ],
});
