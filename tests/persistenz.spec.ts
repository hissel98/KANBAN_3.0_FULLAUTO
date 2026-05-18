import { test, expect } from '@playwright/test'
import { loginAsTestUser } from './auth-helper'

/**
 * Test-Suite: Persistenz
 */

test.describe('Persistenz', () => {
  test('should persist data after page reload', async ({ page }) => {
    await loginAsTestUser(page)
    await page.goto('/dashboard')
    
    const boardTitle = `Persist ${Date.now()}`
    await page.click('text=Create Board')
    await page.fill('input[placeholder="Board title"]', boardTitle)
    await page.click('text=Create')
    await page.waitForSelector('text=' + boardTitle, { timeout: 5000 })
    
    // Reload
    await page.reload()
    await expect(page.locator('text=' + boardTitle)).toBeVisible({ timeout: 5000 })
  })

  test('should persist data after logout and re-login', async ({ page }) => {
    await loginAsTestUser(page)
    await page.goto('/dashboard')
    
    const boardTitle = `ReLogin ${Date.now()}`
    await page.click('text=Create Board')
    await page.fill('input[placeholder="Board title"]', boardTitle)
    await page.click('text=Create')
    await page.waitForSelector('text=' + boardTitle, { timeout: 5000 })
    
    // Logout
    await page.click('button:has-text("Kloda.ch@gmail.com")')
    await page.click('text=Sign Out')
    await page.waitForSelector('button:has-text("Sign In"):not(:has-text("Google"))', { timeout: 10000 })
    
    // Re-login
    await loginAsTestUser(page)
    await page.goto('/dashboard')
    await expect(page.locator('text=' + boardTitle)).toBeVisible({ timeout: 5000 })
  })

  test('should not show other users boards', async ({ browser }) => {
    const context1 = await browser.newContext()
    const page1 = await context1.newPage()
    
    // User 1 erstellt ein Board
    await loginAsTestUser(page1)
    await page1.goto('/dashboard')
    const boardTitle = `Private ${Date.now()}`
    await page1.click('text=Create Board')
    await page1.fill('input[placeholder="Board title"]', boardTitle)
    await page1.click('text=Create')
    await page1.waitForSelector('text=' + boardTitle, { timeout: 5000 })
    
    // User 2 (unauthentifiziert) darf Board nicht sehen
    const context2 = await browser.newContext()
    const page2 = await context2.newPage()
    await page2.goto('/dashboard')
    await page2.waitForSelector('button:has-text("Sign In"):not(:has-text("Google"))', { timeout: 10000 })
    
    await context1.close()
    await context2.close()
  })
})
