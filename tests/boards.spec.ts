import { test, expect } from '@playwright/test'

/**
 * Test-Suite: Boards
 * 
 * Setup: Nutzt Auth-State aus global-setup.ts.
 */

test.describe('Boards', () => {
  test('should create a new board', async ({ page }) => {
    await page.goto('/dashboard')
    
    const boardTitle = `Test Board ${Date.now()}`
    
    // "Create new board" klicken
    await page.click('text=Create new board')
    
    // Titel eingeben
    await page.fill('input[placeholder="Board title"]', boardTitle)
    
    // Erstellen bestaetigen
    await page.click('text=Create')
    
    // Board sollte im Dashboard erscheinen
    await expect(page.locator('text=' + boardTitle)).toBeVisible({ timeout: 5000 })
  })

  test('should rename a board', async ({ page }) => {
    await page.goto('/dashboard')
    
    // Zuerst ein Board erstellen
    const oldTitle = `Rename Test ${Date.now()}`
    await page.click('text=Create new board')
    await page.fill('input[placeholder="Board title"]', oldTitle)
    await page.click('text=Create')
    await page.waitForSelector('text=' + oldTitle, { timeout: 5000 })
    
    // Board umbenennen
    const newTitle = `Renamed ${Date.now()}`
    const boardCard = page.locator(`text=${oldTitle}`).first()
    await boardCard.hover()
    
    // Edit-Button klicken (der Stift-Button im Board-Card)
    await boardCard.locator('xpath=../../..').locator('button').nth(0).click()
    
    // Neuen Titel eingeben
    const input = page.locator('input').first()
    await input.fill(newTitle)
    await input.press('Enter')
    
    // Neuer Titel sollte sichtbar sein
    await expect(page.locator('text=' + newTitle)).toBeVisible({ timeout: 5000 })
  })

  test('should delete a board', async ({ page }) => {
    await page.goto('/dashboard')
    
    // Zuerst ein Board erstellen
    const title = `Delete Test ${Date.now()}`
    await page.click('text=Create new board')
    await page.fill('input[placeholder="Board title"]', title)
    await page.click('text=Create')
    await page.waitForSelector('text=' + title, { timeout: 5000 })
    
    // Board loeschen
    const boardCard = page.locator(`text=${title}`).first()
    await boardCard.hover()
    
    // Delete-Button klicken (Muelleimer-Button)
    await boardCard.locator('xpath=../../..').locator('button').nth(1).click()
    
    // Bestaetigen
    await page.click('text=Delete')
    
    // Board sollte verschwunden sein
    await expect(page.locator('text=' + title)).not.toBeVisible({ timeout: 5000 })
  })
})
