import { Page } from '@playwright/test'

/**
 * Hilfsfunktion: Einloggen als Test-User
 */
export async function loginAsTestUser(page: Page) {
  await page.goto('/login')
  await page.fill('input[type="email"]', 'Kloda.ch@gmail.com')
  await page.fill('input[type="password"]', 'test1234')
  await page.click('button:has-text("Sign In"):not(:has-text("Google"))')
  await page.waitForSelector('h1:has-text("Boards")', { timeout: 15000 })
}
