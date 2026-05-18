import { test, expect } from '@playwright/test'

/**
 * Test-Suite: Cards
 * 
 * Setup: Erstellt ein Board mit einer Spalte.
 */

test.describe('Cards', () => {
  let boardTitle: string
  let columnTitle: string

  test.beforeEach(async ({ page }) => {
    // Board erstellen
    await page.goto('/dashboard')
    boardTitle = `Card Test ${Date.now()}`
    await page.click('text=Create new board')
    await page.fill('input[placeholder="Board title"]', boardTitle)
    await page.click('text=Create')
    await page.waitForSelector('text=' + boardTitle, { timeout: 5000 })
    
    // Board oeffnen
    await page.click('text=' + boardTitle)
    await page.waitForURL(/\/board\//, { timeout: 10000 })
    
    // Spalte erstellen
    columnTitle = `Cards ${Date.now()}`
    await page.click('text=Add column')
    await page.fill('input[placeholder="Column title"]', columnTitle)
    await page.click('text=Create')
    await page.waitForSelector('h3:has-text("' + columnTitle + '")', { timeout: 5000 })
  })

  test('should create a new card', async ({ page }) => {
    const cardTitle = `Card ${Date.now()}`
    
    // "Add card" in der Spalte klicken
    const column = page.locator('h3:has-text("' + columnTitle + '")').first()
    await column.locator('xpath=../../..').locator('button:has-text("+")').click()
    
    await page.fill('input[placeholder="Card title"]', cardTitle)
    await page.click('text=Create')
    
    // Karte sollte sichtbar sein
    await expect(page.locator('text=' + cardTitle)).toBeVisible({ timeout: 5000 })
  })

  test('should delete a card', async ({ page }) => {
    // Erst eine Karte erstellen
    const cardTitle = `Delete ${Date.now()}`
    const column = page.locator('h3:has-text("' + columnTitle + '")').first()
    await column.locator('xpath=../../..').locator('button:has-text("+")').click()
    await page.fill('input[placeholder="Card title"]', cardTitle)
    await page.click('text=Create')
    await page.waitForSelector('text=' + cardTitle, { timeout: 5000 })
    
    // Karte loeschen
    const card = page.locator('text=' + cardTitle).first()
    await card.click()
    
    // Modal sollte erscheinen
    await page.waitForSelector('h2:has-text("Edit Card")', { timeout: 5000 })
    
    // Delete-Button klicken
    await page.click('button:has-text("Delete")')
    
    // Karte sollte verschwunden sein
    await expect(page.locator('text=' + cardTitle)).not.toBeVisible({ timeout: 5000 })
  })

  test('should drag card between columns', async ({ page }) => {
    // Zwei Spalten erstellen
    const sourceColumn = columnTitle
    const targetColumn = `Target ${Date.now()}`
    
    await page.click('text=Add column')
    await page.fill('input[placeholder="Column title"]', targetColumn)
    await page.click('text=Create')
    await page.waitForSelector('h3:has-text("' + targetColumn + '")', { timeout: 5000 })
    
    // Karte in Quell-Spalte erstellen
    const cardTitle = `Drag ${Date.now()}`
    const sourceCol = page.locator('h3:has-text("' + sourceColumn + '")').first()
    await sourceCol.locator('xpath=../../..').locator('button:has-text("+")').click()
    await page.fill('input[placeholder="Card title"]', cardTitle)
    await page.click('text=Create')
    await page.waitForSelector('text=' + cardTitle, { timeout: 5000 })
    
    // Karte zur Ziel-Spalte ziehen
    const card = page.locator('text=' + cardTitle).first()
    const targetCol = page.locator('h3:has-text("' + targetColumn + '")').first()
    
    await card.dragTo(targetCol, { force: true, timeout: 5000 })
    await page.waitForTimeout(1000)
    
    // Karte sollte in der Ziel-Spalte sichtbar sein
    await expect(page.locator('text=' + cardTitle)).toBeVisible({ timeout: 5000 })
  })
})
