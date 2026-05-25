import { env } from '@/env/next'
import { test as setup, expect } from '@playwright/test'
import path from 'path'

const authFile = path.join(__dirname, '.auth/user.json')

const SEED_EMAIL = env.SEED_USER_EMAIL ?? 'test@clothes-tool.test'
const SEED_PASSWORD = env.SEED_USER_PASSWORD ?? 'TestPass123!'

setup('authenticate as seed user', async ({ page }) => {
  await page.goto('/signin')
  await page.locator('input[name="email"]').fill(SEED_EMAIL)
  await page.locator('input[name="password"]').fill(SEED_PASSWORD)
  await page.locator('button[type="submit"]').click()

  await expect(page).toHaveURL('/')

  await page.context().storageState({ path: authFile })
})
