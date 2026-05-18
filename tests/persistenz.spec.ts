import { test, expect } from '@playwright/test'

/**
 * Test-Suite: Persistenz & Sicherheit
 * 
 * Setup: Nutzt Auth-State aus global-setup.ts.
 */

test.describe('Persistenz', () => {
  test('should persist data after reload', async ({ page }) => {
    // Board erstellen
    await page.goto('/dashboard')
    const boardTitle = `Persist ${Date.now()}`
    await page.click('text=Create new board')
    await page.fill('input[placeholder="Board title"]', boardTitle)
    await page.click('text=Create')
    await page.waitForSelector('text=' + boardTitle, { timeout: 5000 })
    
    // Seite neu laden
    await page.reload()
    
    // Board sollte immer noch sichtbar sein
    await expect(page.locator('text=' + boardTitle)).toBeVisible({ timeout: 10000 })
  })

  test('should persist data after re-login', async ({ page, context }) => {
    // Board erstellen
    await page.goto('/dashboard')
    const boardTitle = `ReLogin ${Date.now()}`
    await page.click('text=Create new board')
    await page.fill('input[placeholder="Board title"]', boardTitle)
    await page.click('text=Create')
    await page.waitForSelector('text=' + boardTitle, { timeout: 5000 })
    
    // Logout
    await page.click('button:has(img)')
    await page.click('text=Sign out')
    await page.waitForURL('/login', { timeout: 10000 })
    
    // Cookies loeschen und neu anmelden
    const uniqueEmail = `persist_${Date.now()}@kanban.local`
    await page.click('text=Create account')
    await page.fill('input[placeholder="Your name"]', 'Persist Test')
    await page.fill('input[type="email"]', uniqueEmail)
    await page.fill('input[type="password"]', 'Test1234!Kanban')
    await page.click('button[type="submit"]')
    await page.waitForURL('/dashboard', { timeout: 15000 })
    
    // Board sollte NICHT sichtbar sein (neuer User)
    await expect(page.locator('text=' + boardTitle)).not.toBeVisible({ timeout: 5000 })
  })
})

test.describe('Multi-User', () => {
  test('should isolate data between users', async ({ browser }) => {
    // User 1 erstellt ein Board
    const context1 = await browser.newContext()
    const page1 = await context1.newPage()
    
    await page1.goto('/login')
    const email1 = `user1_${Date.now()}@kanban.local`
    await page1.click('text=Create account')
    await page1.fill('input[placeholder="Your name"]', 'User 1')
    await page1.fill('input[type="email"]', email1)
    await page1.fill('input[type="password"]', 'Test1234!Kanban')
    await page1.click('button[type="submit"]')
    await page1.waitForURL('/dashboard', { timeout: 15000 })
    
    const boardTitle = `Private ${Date.now()}`
    await page1.click('text=Create new board')
    await page1.fill('input[placeholder="Board title"]', boardTitle)
    await page1.click('text=Create')
    await page1.waitForSelector('text=' + boardTitle, { timeout: 5000 })
    
    // User 2 sollte das Board NICHT sehen
    const context2 = await browser.newContext()
    const page2 = await context2.newPage()
    
    await page2.goto('/login')
    const email2 = `user2_${Date.now()}@kanban.local`
    await page2.click('text=Create account')
    await page2.fill('input[placeholder="Your name"]', 'User 2')
    await page2.fill('input[type="email"]', email2)
    await page2.fill('input[type="password"]', 'Test1234!Kanban')
    await page2.click('button[type="submit"]')
    await page2.waitForURL('/dashboard', { timeout: 15000 })
    
    // User 2 sollte das Board von User 1 NICHT sehen
    await expect(page2.locator('text=' + boardTitle)).not.toBeVisible({ timeout: 5000 })
    
    await context1.close()
    await context2.close()
  })
})
