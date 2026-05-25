import { env } from '@/env/next'
import { test, expect } from '@playwright/test'

const SEED_EMAIL = env.SEED_USER_EMAIL ?? 'test@clothes-tool.test'
const SEED_PASSWORD = env.SEED_USER_PASSWORD ?? 'TestPass123!'

test('unauthenticated visit to / redirects to /signin', async ({ page }) => {
  await page.goto('/')
  await expect(page).toHaveURL(/\/signin/)
})

test('sign in with valid credentials lands on /', async ({ page }) => {
  await page.goto('/signin')
  await page.locator('input[name="email"]').fill(SEED_EMAIL)
  await page.locator('input[name="password"]').fill(SEED_PASSWORD)
  await page.locator('button[type="submit"]').click()

  await expect(page).toHaveURL('/')
})

test('sign in with invalid credentials shows error', async ({ page }) => {
  await page.goto('/signin')
  await page.locator('input[name="email"]').fill('wrong@example.com')
  await page.locator('input[name="password"]').fill('wrongpassword')
  await page.locator('button[type="submit"]').click()

  await expect(page.locator('p.text-destructive')).toBeVisible()
  await expect(page).toHaveURL(/\/signin/)
})

test('sign out redirects to /signin', async ({ page }) => {
  await page.goto('/signin')
  await page.locator('input[name="email"]').fill(SEED_EMAIL)
  await page.locator('input[name="password"]').fill(SEED_PASSWORD)
  await page.locator('button[type="submit"]').click()
  await expect(page).toHaveURL('/')

  await page.getByRole('button', { name: /sign out/i }).click()
  await expect(page).toHaveURL(/\/signin/)
})

test('authenticated user visiting /signin is redirected to /', async ({ page }) => {
  await page.goto('/signin')
  await page.locator('input[name="email"]').fill(SEED_EMAIL)
  await page.locator('input[name="password"]').fill(SEED_PASSWORD)
  await page.locator('button[type="submit"]').click()
  await expect(page).toHaveURL('/')

  await page.goto('/signin')
  await expect(page).toHaveURL('/')
})

test.describe('sign-up flow', () => {
  test('clicking sign-up toggle switches the form to sign-up mode', async ({ page }) => {
    await page.goto('/signin')
    await page.getByText('Sign up', { exact: true }).click()

    await expect(page.locator('button[type="submit"]')).toHaveText(/sign up/i)
  })

  test('duplicate email during sign-up shows an error', async ({ page }) => {
    await page.goto('/signin')
    await page.getByText('Sign up', { exact: true }).click()

    await page.locator('input[name="email"]').fill(SEED_EMAIL)
    await page.locator('input[name="password"]').fill('ValidPass123!')
    await page.locator('button[type="submit"]').click()

    await expect(page.locator('p.text-destructive')).toBeVisible()
    await expect(page).toHaveURL(/\/signin/)
  })

  test('valid new sign-up navigates to /', async ({ page }) => {
    const uniqueEmail = `test-${Date.now()}@example.com`

    await page.goto('/signin')
    await page.getByText('Sign up', { exact: true }).click()
    await page.locator('input[name="email"]').fill(uniqueEmail)
    await page.locator('input[name="password"]').fill('ValidPass123!')
    await page.locator('button[type="submit"]').click()

    await expect(page).toHaveURL('/')
  })
})
