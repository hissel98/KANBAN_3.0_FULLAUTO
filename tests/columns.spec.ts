import { test, expect } from '@playwright/test'

/**
 * Test-Suite: Columns
 * 
 * Setup: Nutzt Auth-State aus global-setup.ts.
 */

test.describe('Columns', () => {
  let boardTitle: string

  test.beforeEach(async ({ page }) => {
    // Board erstellen und oeffnen
    await page.goto('/dashboard')
    boardTitle = `Column Test ${Date.now()}`
    await page.click('text=Create new board')
    await page.fill('input[placeholder="Board title"]', boardTitle)
    await page.click('text=Create')
    await page.waitForSelector('text=' + boardTitle, { timeout: 5000 })
    
    // Board oeffnen
    await page.click('text=' + boardTitle)
    await page.waitForURL(/\/board\//, { timeout: 10000 })
  })

  test('should create a new column', async ({ page }) => {
    const columnTitle = `Column ${Date.now()}`
    
    await page.click('text=Add column')
    await page.fill('input[placeholder="Column title"]', columnTitle)
    await page.click('text=Create')
    
    // Spalte sollte sichtbar sein
    await expect(page.locator('h3:has-text("' + columnTitle + '")')).toBeVisible({ timeout: 5000 })
  })

  test('should rename a column', async ({ page }) => {
    // Erst eine Spalte erstellen
    const oldTitle = `Old ${Date.now()}`
    await page.click('text=Add column')
    await page.fill('input[placeholder="Column title"]', oldTitle)
    await page.click('text=Create')
    await page.waitForSelector('h3:has-text("' + oldTitle + '")', { timeout: 5000 })
    
    // Spalte umbenennen
    const newTitle = `New ${Date.now()}`
    const column = page.locator('h3:has-text("' + oldTitle + '")').first()
    await column.hover()
    
    // Edit-Button (Stift) klicken
    await column.locator('xpath=../..').locator('button').nth(1).click()
    
    // Neuen Titel eingeben
    const input = page.locator('input').first()
    await input.fill(newTitle)
    await input.press('Enter')
    
    // Neuer Titel sollte sichtbar sein
    await expect(page.locator('h3:has-text("' + newTitle + '")')).toBeVisible({ timeout: 5000 })
  })

  test('should delete a column', async ({ page }) => {
    // Erst eine Spalte erstellen
    const title = `Delete ${Date.now()}`
    await page.click('text=Add column')
    await page.fill('input[placeholder="Column title"]', title)
    await page.click('text=Create')
    await page.waitForSelector('h3:has-text("' + title + '")', { timeout: 5000 })
    
    // Spalte loeschen
    const column = page.locator('h3:has-text("' + title + '")').first()
    await column.hover()
    
    // Delete-Button (Muelleimer) klicken
    await column.locator('xpath=../..').locator('button').nth(2).click()
    
    // Bestaetigen
    await page.click('text=Delete')
    
    // Spalte sollte verschwunden sein
    await expect(page.locator('h3:has-text("' + title + '")')).not.toBeVisible({ timeout: 5000 })
  })
})
