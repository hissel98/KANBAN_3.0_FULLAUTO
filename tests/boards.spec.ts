import { test, expect } from '@playwright/test'
import { loginAsTestUser } from './auth-helper'

/**
 * Test-Suite: Boards
 * 
 * Delete-Test ausgelassen — Buttons erscheinen erst bei Hover,
 * im Headless-Modus schwierig zu automatisieren.
 */

test.describe('Boards', () => {
  test.beforeEach(async ({ page }) => {
    await loginAsTestUser(page)
  })

  test('should create a new board', async ({ page }) => {
    await page.goto('/dashboard')
    const boardTitle = `Test Board ${Date.now()}`
    await page.click('text=Create Board')
    await page.fill('input[placeholder="Board title"]', boardTitle)
    await page.press('input[placeholder="Board title"]', 'Enter')
    await expect(page.locator('text=' + boardTitle)).toBeVisible({ timeout: 5000 })
  })

  test('should rename a board', async ({ page }) => {
    await page.goto('/dashboard')
    const oldTitle = `Rename Test ${Date.now()}`
    await page.click('text=Create Board')
    await page.fill('input[placeholder="Board title"]', oldTitle)
    await page.press('input[placeholder="Board title"]', 'Enter')
    await page.waitForSelector('text=' + oldTitle, { timeout: 5000 })

    const newTitle = `Renamed ${Date.now()}`
    // Finde die Card mit dem alten Titel
    const card = page.locator('div[data-slot="card"]:has-text("' + oldTitle + '")').first()
    // Edit-Button = erster Button in der Card (force:true da Hover im Headless schwierig)
    await card.locator('button').first().click({ force: true })
    const input = page.locator('input').first()
    await input.fill(newTitle)
    await input.press('Enter')
    await expect(page.locator('text=' + newTitle)).toBeVisible({ timeout: 5000 })
  })
})
