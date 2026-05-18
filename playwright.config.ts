import { defineConfig, devices } from '@playwright/test'

/**
 * Playwright-Konfiguration fuer Kanban WebApp E2E-Tests
 * 
 * Tests laufen gegen die Live-URL. Fuer lokale Tests:
 * TEST_BASE_URL=http://localhost:3000 npx playwright test
 */
const baseURL = process.env.TEST_BASE_URL || 'https://www.dasistmeinetest.space'

export default defineConfig({
  globalSetup: './tests/global-setup.ts',
  testDir: './tests',
  fullyParallel: false,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 2 : 0,
  workers: 1,
  reporter: 'list',
  use: {
    baseURL,
    trace: 'on-first-retry',
    screenshot: 'only-on-failure',
    video: 'retain-on-failure',
    // Auth-State fuer alle Tests
    storageState: 'tests/.auth/state.json',
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
