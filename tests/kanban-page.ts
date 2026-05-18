import { test as base, expect, Page } from '@playwright/test'

/**
 * Erzeugt eine eindeutige Test-User-E-Mail mit Zeitstempel.
 */
function generateTestEmail() {
  const timestamp = Date.now()
  return `test_${timestamp}@kanban.local`
}

/**
 * Test-User-Konfiguration
 */
export const TEST_USER = {
  email: generateTestEmail(),
  password: 'Test1234!Kanban',
  displayName: 'E2E Test User',
}

/**
 * Auth-State fuer Playwright
 */
export const AUTH_FILE = 'tests/.auth/user.json'

/**
 * Erweiterte Fixtures fuer Kanban-Tests
 */
export const test = base.extend<{
  kanbanPage: KanbanPage
}>({
  kanbanPage: async ({ page }, use) => {
    const kanban = new KanbanPage(page)
    await use(kanban)
  },
})

/**
 * Kanban Page Object Model
 * Kapselt alle Interaktionen mit der Kanban-App.
 */
export class KanbanPage {
  constructor(public page: Page) {}

  // === Auth ===

  async gotoLogin() {
    await this.page.goto('/login')
    await this.page.waitForSelector('h1')
  }

  async login(email: string, password: string) {
    await this.gotoLogin()
    await this.page.fill('input[type="email"]', email)
    await this.page.fill('input[type="password"]', password)
    await this.page.click('button[type="submit"]')
    // Warte auf Redirect zum Dashboard
    await this.page.waitForURL('/dashboard', { timeout: 10000 })
  }

  async logout() {
    // UserMenu oeffnen
    await this.page.click('[data-testid="user-menu-trigger"]')
    await this.page.waitForSelector('[data-testid="logout-button"]')
    await this.page.click('[data-testid="logout-button"]')
    await this.page.waitForURL('/login', { timeout: 10000 })
  }

  async register(email: string, password: string, displayName: string) {
    await this.gotoLogin()
    await this.page.click('text=Create account')
    await this.page.fill('input[placeholder="Your name"]', displayName)
    await this.page.fill('input[type="email"]', email)
    await this.page.fill('input[type="password"]', password)
    await this.page.click('button[type="submit"]')
    await this.page.waitForURL('/dashboard', { timeout: 15000 })
  }

  // === Boards ===

  async createBoard(title: string) {
    await this.page.waitForSelector('[data-testid="create-board-button"]')
    await this.page.click('[data-testid="create-board-button"]')
    await this.page.fill('[data-testid="board-title-input"]', title)
    await this.page.click('[data-testid="board-create-confirm"]')
    await this.page.waitForSelector(`text=${title}`)
  }

  async renameBoard(oldTitle: string, newTitle: string) {
    const board = this.page.locator(`text=${oldTitle}`).first()
    await board.hover()
    await board.locator('..').locator('[data-testid="board-edit-button"]').click()
    const input = this.page.locator('[data-testid="board-title-input"]')
    await input.fill(newTitle)
    await this.page.click('[data-testid="board-save-button"]')
    await this.page.waitForSelector(`text=${newTitle}`)
  }

  async deleteBoard(title: string) {
    const board = this.page.locator(`text=${title}`).first()
    await board.hover()
    await board.locator('..').locator('[data-testid="board-delete-button"]').click()
    await this.page.click('[data-testid="confirm-delete"]')
    await this.page.waitForSelector(`text=${title}`, { state: 'detached' })
  }

  async openBoard(title: string) {
    await this.page.click(`text=${title}`)
    await this.page.waitForURL(/\/board\//)
  }

  // === Columns ===

  async createColumn(title: string) {
    await this.page.click('[data-testid="add-column-button"]')
    await this.page.fill('[data-testid="column-title-input"]', title)
    await this.page.click('[data-testid="column-create-confirm"]')
    await this.page.waitForSelector(`h3:has-text("${title}")`)
  }

  async renameColumn(oldTitle: string, newTitle: string) {
    const column = this.page.locator(`h3:has-text("${oldTitle}")`).first()
    await column.locator('xpath=../..').locator('[data-testid="column-edit-button"]').click()
    const input = this.page.locator('[data-testid="column-title-input"]')
    await input.fill(newTitle)
    await input.press('Enter')
    await this.page.waitForSelector(`h3:has-text("${newTitle}")`)
  }

  async deleteColumn(title: string) {
    const column = this.page.locator(`h3:has-text("${title}")`).first()
    await column.locator('xpath=../..').locator('[data-testid="column-delete-button"]').click()
    await this.page.click('[data-testid="confirm-delete"]')
    await this.page.waitForSelector(`h3:has-text("${title}")`, { state: 'detached' })
  }

  // === Cards ===

  async createCard(columnTitle: string, cardTitle: string) {
    const column = this.page.locator(`h3:has-text("${columnTitle}")`).first()
    await column.locator('xpath=../../..').locator('[data-testid="add-card-button"]').click()
    await this.page.fill('[data-testid="card-title-input"]', cardTitle)
    await this.page.click('[data-testid="card-create-confirm"]')
    await this.page.waitForSelector(`text=${cardTitle}`)
  }

  async deleteCard(cardTitle: string) {
    const card = this.page.locator(`text=${cardTitle}`).first()
    await card.click()
    await this.page.waitForSelector('[data-testid="card-modal"]')
    await this.page.click('[data-testid="delete-card-button"]')
    await this.page.waitForSelector(`text=${cardTitle}`, { state: 'detached' })
  }

  async dragCardToColumn(cardTitle: string, targetColumnTitle: string) {
    const card = this.page.locator(`text=${cardTitle}`).first()
    const targetColumn = this.page.locator(`h3:has-text("${targetColumnTitle}")`).first()
    
    await card.dragTo(targetColumn, {
      force: true,
      timeout: 5000,
    })
    // Kurze Pause fuer Animation
    await this.page.waitForTimeout(500)
  }

  // === Assertions ===

  async expectToast(message: string) {
    await expect(this.page.locator(`text=${message}`).first()).toBeVisible({ timeout: 5000 })
  }

  async expectUrl(path: string | RegExp) {
    await expect(this.page).toHaveURL(path)
  }
}

export { expect }
