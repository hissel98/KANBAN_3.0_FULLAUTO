import { test, expect } from '@playwright/test'
import { loginAsTestUser } from './auth-helper'

/**
 * Test-Suite: Cards
 */

test.describe('Cards', () => {
  let boardTitle: string

  test.beforeEach(async ({ page }) => {
    await loginAsTestUser(page)
    await page.goto('/dashboard')
    boardTitle = `Card Test ${Date.now()}`
    await page.click('text=Create Board')
    await page.fill('input[placeholder="Board title"]', boardTitle)
    await page.press('input[placeholder="Board title"]', 'Enter')
    await page.waitForSelector('text=' + boardTitle, { timeout: 5000 })
    await page.click('text=' + boardTitle)
    await page.waitForURL(/\/board\//, { timeout: 10000 })

    // Eine Column erstellen fuer die Karten
    await page.click('text=Add Column')
    await page.fill('input[placeholder="Column title"]', 'Todo')
    await page.press('input[placeholder="Column title"]', 'Enter')
    await page.waitForSelector('h3:has-text("Todo")', { timeout: 5000 })
  })

  test('should create a new card', async ({ page }) => {
    const cardTitle = `Card ${Date.now()}`
    // Add Card Button im Board-Header
    await page.click('text=Add Card')
    await page.fill('input[placeholder="Enter card title"]', cardTitle)
    await page.press('input[placeholder="Enter card title"]', 'Enter')
    await expect(page.locator('text=' + cardTitle)).toBeVisible({ timeout: 5000 })
  })

  test('should delete a card', async ({ page }) => {
    const title = `Delete Card ${Date.now()}`
    await page.click('text=Add Card')
    await page.fill('input[placeholder="Enter card title"]', title)
    await page.press('input[placeholder="Enter card title"]', 'Enter')
    await page.waitForSelector('text=' + title, { timeout: 5000 })

    // Card hover to reveal delete button
    const card = page.locator('h4:has-text("' + title + '")').locator('xpath=../..')
    await card.hover()
    
    // Handle browser confirm dialog
    page.on('dialog', dialog => dialog.accept())
    
    // Find and click the trash/delete button (second button in the card actions)
    const deleteButton = card.locator('button').nth(1)
    await deleteButton.click()
    
    await expect(page.locator('text=' + title)).not.toBeVisible({ timeout: 5000 })
  })
})
