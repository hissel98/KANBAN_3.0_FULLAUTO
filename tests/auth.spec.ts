import { test, expect } from '@playwright/test'

/**
 * Test-Suite: Authentication
 * 
 * Diese Tests laufen OHNE Auth-State, da sie Login/Logout testen.
 * Alle anderen Test-Suites verwenden den von global-setup.ts erstellten Auth-State.
 */

// Kein storageState — Tests starten bei null
test.use({ storageState: undefined })

test.describe('Auth', () => {
  test('should register new user', async ({ page }) => {
    await page.goto('/login')
    
    // Auf "Create account" klicken
    await page.click('text=Create account')
    
    // Formular ausfuellen
    await page.fill('input[placeholder="Your name"]', 'E2E Test User')
    const uniqueEmail = `test_${Date.now()}@kanban.local`
    await page.fill('input[type="email"]', uniqueEmail)
    await page.fill('input[type="password"]', 'Test1234!Kanban')
    await page.click('button[type="submit"]')
    
    // Sollte zum Dashboard weiterleiten
    await expect(page).toHaveURL('/dashboard', { timeout: 15000 })
    
    // Dashboard sollte sichtbar sein
    await expect(page.locator('h1')).toContainText('My Boards')
  })

  test('should login with email and password', async ({ page }) => {
    // Zuerst registrieren (damit der User existiert)
    await page.goto('/login')
    await page.click('text=Create account')
    const uniqueEmail = `login_${Date.now()}@kanban.local`
    await page.fill('input[placeholder="Your name"]', 'Login Test')
    await page.fill('input[type="email"]', uniqueEmail)
    await page.fill('input[type="password"]', 'Test1234!Kanban')
    await page.click('button[type="submit"]')
    await page.waitForURL('/dashboard', { timeout: 15000 })
    
    // Logout
    await page.click('button:has(img)')
    await page.click('text=Sign out')
    await page.waitForURL('/login', { timeout: 10000 })
    
    // Login
    await page.fill('input[type="email"]', uniqueEmail)
    await page.fill('input[type="password"]', 'Test1234!Kanban')
    await page.click('button[type="submit"]')
    
    await expect(page).toHaveURL('/dashboard', { timeout: 10000 })
    await expect(page.locator('h1')).toContainText('My Boards')
  })

  test('should logout and redirect to login', async ({ page }) => {
    // Einloggen (mit neuem User)
    await page.goto('/login')
    await page.click('text=Create account')
    const uniqueEmail = `logout_${Date.now()}@kanban.local`
    await page.fill('input[placeholder="Your name"]', 'Logout Test')
    await page.fill('input[type="email"]', uniqueEmail)
    await page.fill('input[type="password"]', 'Test1234!Kanban')
    await page.click('button[type="submit"]')
    await page.waitForURL('/dashboard', { timeout: 15000 })
    
    // Logout
    await page.click('button:has(img)')
    await page.click('text=Sign out')
    
    // Sollte zur Login-Seite umleiten
    await expect(page).toHaveURL('/login', { timeout: 10000 })
    
    // Login-Formular sollte sichtbar sein
    await expect(page.locator('h1')).toContainText('Welcome back')
  })

  test('should redirect unauthenticated user to login', async ({ page }) => {
    await page.goto('/dashboard')
    await expect(page).toHaveURL('/login', { timeout: 10000 })
  })

  test('should redirect authenticated user away from login', async ({ page }) => {
    // Einloggen
    await page.goto('/login')
    await page.click('text=Create account')
    const uniqueEmail = `redirect_${Date.now()}@kanban.local`
    await page.fill('input[placeholder="Your name"]', 'Redirect Test')
    await page.fill('input[type="email"]', uniqueEmail)
    await page.fill('input[type="password"]', 'Test1234!Kanban')
    await page.click('button[type="submit"]')
    await page.waitForURL('/dashboard', { timeout: 15000 })
    
    // Zurueck zur Login-Seite
    await page.goto('/login')
    
    // Sollte zum Dashboard umleiten
    await expect(page).toHaveURL('/dashboard', { timeout: 10000 })
  })
})
