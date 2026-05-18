import { test, expect } from '@playwright/test'
import { loginAsTestUser } from './auth-helper'

/**
 * Test-Suite: Boards
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
    const boardCard = page.locator(`text=${oldTitle}`).first()
    await boardCard.hover()
    await boardCard.locator('xpath=../../..').locator('button').nth(0).click()
    const input = page.locator('input').first()
    await input.fill(newTitle)
    await input.press('Enter')
    await expect(page.locator('text=' + newTitle)).toBeVisible({ timeout: 5000 })
  })

  test('should delete a board', async ({ page }) => {
    await page.goto('/dashboard')
    const title = `Delete Test ${Date.now()}`
    await page.click('text=Create Board')
    await page.fill('input[placeholder="Board title"]', title)
    await page.press('input[placeholder="Board title"]', 'Enter')
    await page.waitForSelector('text=' + title, { timeout: 5000 })

    const boardCard = page.locator(`text=${title}`).first()
    await boardCard.hover()
    // Delete-Button = letzter Button in der Card (nach Edit)
    const card = page.locator('.apple-card:has-text("' + title + '")').first()
    const buttons = card.locator('button')
    await buttons.last().click()
    
    // Browser-confirm dialog akzeptieren
    page.on('dialog', dialog => dialog.accept())
    
    await page.waitForTimeout(1000)
    await expect(page.locator('text=' + title)).not.toBeVisible({ timeout: 5000 })
  })
})
