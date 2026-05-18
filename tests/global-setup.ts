import { chromium, FullConfig } from '@playwright/test'

/**
 * Global Setup fuer Playwright Tests
 * 
 * Erstellt einen Test-User und speichert den Auth-State,
 * damit alle Tests den gleichen User verwenden koennen.
 */

const TEST_EMAIL = `test_${Date.now()}@kanban.local`
const TEST_PASSWORD = 'Test1234!Kanban'
const TEST_DISPLAY_NAME = 'E2E Test User'

export default async function globalSetup(config: FullConfig) {
  const { baseURL } = config.projects[0].use
  const browser = await chromium.launch()
  const page = await browser.newPage({ baseURL })

  try {
    // Registrierung
    await page.goto('/login')
    await page.click('text=Create account')
    await page.fill('input[placeholder="Your name"]', TEST_DISPLAY_NAME)
    await page.fill('input[type="email"]', TEST_EMAIL)
    await page.fill('input[type="password"]', TEST_PASSWORD)
    await page.click('button[type="submit"]')
    await page.waitForURL('/dashboard', { timeout: 15000 })

    // Auth-State speichern
    await page.context().storageState({ path: 'tests/.auth/state.json' })
    
    // Credentials in Datei speichern fuer andere Test-Suites
    const fs = await import('fs')
    fs.mkdirSync('tests/.auth', { recursive: true })
    fs.writeFileSync('tests/.auth/credentials.json', JSON.stringify({
      email: TEST_EMAIL,
      password: TEST_PASSWORD,
      displayName: TEST_DISPLAY_NAME,
    }))

    console.log(`Test user created: ${TEST_EMAIL}`)
  } catch (e) {
    console.error('Failed to create test user:', e)
    throw e
  } finally {
    await browser.close()
  }
}
