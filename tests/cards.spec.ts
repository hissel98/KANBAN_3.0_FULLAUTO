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
    await page.click('text=Add Card')
    await page.fill('input[placeholder="Card title"]', cardTitle)
    await page.press('input[placeholder="Card title"]', 'Enter')
    await expect(page.locator('text=' + cardTitle)).toBeVisible({ timeout: 5000 })
  })

  test('should delete a card', async ({ page }) => {
    const title = `Delete Card ${Date.now()}`
    await page.click('text=Add Card')
    await page.fill('input[placeholder="Card title"]', title)
    await page.press('input[placeholder="Card title"]', 'Enter')
    await page.waitForSelector('text=' + title, { timeout: 5000 })

    const card = page.locator('text=' + title).first()
    await card.click()
    await page.click('text=Delete')
    await page.click('text=Delete') // Bestaetigen
    await expect(page.locator('text=' + title)).not.toBeVisible({ timeout: 5000 })
  })

  test('should drag card between columns', async ({ page }) => {
    // Zweite Column erstellen
    await page.click('text=Add Column')
    await page.fill('input[placeholder="Column title"]', 'Done')
    await page.press('input[placeholder="Column title"]', 'Enter')
    await page.waitForSelector('h3:has-text("Done")', { timeout: 5000 })

    const cardTitle = `Drag Card ${Date.now()}`
    await page.click('text=Add Card')
    await page.fill('input[placeholder="Card title"]', cardTitle)
    await page.press('input[placeholder="Card title"]', 'Enter')
    await page.waitForSelector('text=' + cardTitle, { timeout: 5000 })

    const card = page.locator('text=' + cardTitle).first()
    const doneColumn = page.locator('h3:has-text("Done")').first()

    await card.dragTo(doneColumn)

    // Card sollte in Done-Column sichtbar sein
    await expect(page.locator('h3:has-text("Done")').first().locator('xpath=../..').locator('text=' + cardTitle)).toBeVisible({ timeout: 5000 })
  })
})
