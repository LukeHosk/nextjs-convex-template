import { test as setup, expect } from '@playwright/test'
import path from 'path'

const authFile = path.join(__dirname, '.auth/user.json')

// Read seed credentials from environment since importing the project's env
// helper pulls ESM-only packages which Playwright's loader can't require.
const SEED_EMAIL = process.env.SEED_USER_EMAIL ?? 'test@example.test'
const SEED_PASSWORD = process.env.SEED_USER_PASSWORD ?? 'TestPass123!'

setup('authenticate as seed user', async ({ page }) => {
  await page.goto('/signin')
  await page.locator('input[name="email"]').fill(SEED_EMAIL)
  await page.locator('input[name="password"]').fill(SEED_PASSWORD)
  await page.locator('button[type="submit"]').click()

  await expect(page).toHaveURL('/')

  await page.context().storageState({ path: authFile })
})
