import { test, expect } from '@playwright/test'
import { loginAsTestUser } from './auth-helper'

/**
 * Test-Suite: Authentication
 */

test.describe('Auth', () => {
  test('should login with email and password', async ({ page }) => {
    await loginAsTestUser(page)
    await expect(page.locator('h1:has-text("Boards")')).toBeVisible()
  })

  test('should logout and redirect to login', async ({ page }) => {
    await loginAsTestUser(page)
    
    // Logout - UserMenu oeffnen
    await page.click('button:has-text("Kloda.ch@gmail.com")')
    
    // Auf "Sign Out" klicken
    await page.click('text=Sign Out')
    
    // Warte auf Login-Seite - pruefe Sign In Button
    await expect(page.locator('button:has-text("Sign In"):not(:has-text("Google"))')).toBeVisible({ timeout: 10000 })
  })

  test('should redirect unauthenticated user to login', async ({ browser }) => {
    // Neuer Browser-Context OHNE Cookies
    const context = await browser.newContext()
    const page = await context.newPage()
    
    await page.goto('/dashboard')
    await expect(page.locator('button:has-text("Sign In"):not(:has-text("Google"))')).toBeVisible({ timeout: 10000 })
    
    await context.close()
  })

  test('should redirect authenticated user away from login', async ({ page }) => {
    await loginAsTestUser(page)
    
    // Zurueck zur Login-Seite
    await page.goto('/login')
    
    // Sollte zum Dashboard umleiten
    await expect(page.locator('h1:has-text("Boards")')).toBeVisible({ timeout: 10000 })
  })
})
