import { chromium, FullConfig } from '@playwright/test'

/**
 * Global Setup fuer Playwright Tests
 * 
 * Loggt sich mit dem festen Test-User ein und speichert den Auth-State.
 */

const TEST_EMAIL = 'Kloda.ch@gmail.com'
const TEST_PASSWORD = 'test1234'

export default async function globalSetup(config: FullConfig) {
  const { baseURL } = config.projects[0].use
  const browser = await chromium.launch()
  const page = await browser.newPage({ baseURL })

  try {
    // Login mit festem Test-User
    await page.goto('/login')
    await page.waitForSelector('input[type="email"]', { timeout: 10000 })
    
    await page.fill('input[type="email"]', TEST_EMAIL)
    await page.fill('input[type="password"]', TEST_PASSWORD)
    await page.click('button:has-text("Sign In"):not(:has-text("Google"))')
    
    // Warte auf Dashboard (nicht URL, da client-side redirect)
    await page.waitForSelector('h1:has-text("Boards")', { timeout: 15000 })
    
    // Auth-State speichern
    await page.context().storageState({ path: 'tests/.auth/state.json' })
    
    console.log(`Test user logged in: ${TEST_EMAIL}`)
  } catch (e) {
    console.error('Failed to login test user:', e)
    throw e
  } finally {
    await browser.close()
  }
}
