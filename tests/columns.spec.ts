import { test, expect } from '@playwright/test'
import { loginAsTestUser } from './auth-helper'

/**
 * Test-Suite: Columns
 */

test.describe('Columns', () => {
  let boardTitle: string

  test.beforeEach(async ({ page }) => {
    await loginAsTestUser(page)
    await page.goto('/dashboard')
    boardTitle = `Column Test ${Date.now()}`
    await page.click('text=Create new board')
    await page.fill('input[placeholder="Board title"]', boardTitle)
    await page.click('text=Create')
    await page.waitForSelector('text=' + boardTitle, { timeout: 5000 })
    await page.click('text=' + boardTitle)
    await page.waitForURL(/\/board\//, { timeout: 10000 })
  })

  test('should create a new column', async ({ page }) => {
    const columnTitle = `Column ${Date.now()}`
    await page.click('text=Add Column')
    await page.fill('input[placeholder="Column title"]', columnTitle)
    await page.press('input[placeholder="Column title"]', 'Enter')
    await expect(page.locator('h3:has-text("' + columnTitle + '")')).toBeVisible({ timeout: 5000 })
  })

  test('should rename a column', async ({ page }) => {
    const oldTitle = `Old ${Date.now()}`
    await page.click('text=Add Column')
    await page.fill('input[placeholder="Column title"]', oldTitle)
    await page.press('input[placeholder="Column title"]', 'Enter')
    await page.waitForSelector('h3:has-text("' + oldTitle + '")', { timeout: 5000 })

    const newTitle = `New ${Date.now()}`
    const column = page.locator('h3:has-text("' + oldTitle + '")').first()
    await column.hover()
    await column.locator('xpath=../..').locator('button').nth(1).click()
    const input = page.locator('input').first()
    await input.fill(newTitle)
    await input.press('Enter')
    await expect(page.locator('h3:has-text("' + newTitle + '")')).toBeVisible({ timeout: 5000 })
  })

  test('should delete a column', async ({ page }) => {
    const title = `Delete ${Date.now()}`
    await page.click('text=Add Column')
    await page.fill('input[placeholder="Column title"]', title)
    await page.press('input[placeholder="Column title"]', 'Enter')
    await page.waitForSelector('h3:has-text("' + title + '")', { timeout: 5000 })

    const column = page.locator('h3:has-text("' + title + '")').first()
    await column.hover()
    await column.locator('xpath=../..').locator('button').nth(2).click()
    await page.click('text=Delete')
    await expect(page.locator('h3:has-text("' + title + '")')).not.toBeVisible({ timeout: 5000 })
  })
})
