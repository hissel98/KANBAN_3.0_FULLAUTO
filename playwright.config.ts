import { defineConfig, devices } from '@playwright/test'

/**
 * Playwright-Konfiguration fuer Kanban WebApp E2E-Tests
 * 
 * Tests starten lokal automatisch den Next.js Dev Server.
 * Fuer externe Ziele: TEST_BASE_URL=https://example.com npx playwright test
 */
const baseURL = process.env.TEST_BASE_URL || 'http://127.0.0.1:3000'

export default defineConfig({
  globalSetup: './tests/global-setup.ts',
  testDir: './tests',
  fullyParallel: false,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 2 : 0,
  workers: 1,
  reporter: 'list',
  webServer: process.env.TEST_BASE_URL
    ? undefined
    : {
        command: 'npm run dev',
        url: baseURL,
        reuseExistingServer: !process.env.CI,
        timeout: 120_000,
      },
  use: {
    baseURL,
    trace: 'on-first-retry',
    screenshot: 'only-on-failure',
    video: 'retain-on-failure',
  },

  projects: [
    {
      name: 'chromium',
      use: { ...devices['Desktop Chrome'] },
    },
    {
      name: 'Mobile Safari',
      use: { ...devices['iPhone 14'] },
    },
  ],
})
