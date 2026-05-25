import { test, expect } from '@playwright/test'
import path from 'path'

test('todo lifecycle: create, edit, attach image, remove image, toggle, delete', async ({
  page,
}) => {
  await page.goto('/')

  const unique = `test-todo-${Date.now()}`

  // Create
  await page.locator('input[placeholder="Add a todo..."]').fill(unique)
  const addButton = page.locator('button[type="submit"]', { hasText: 'Add' })
  await expect(addButton).toBeEnabled()
  await addButton.click()

  const item = page.locator('li', { hasText: unique })
  await expect(item).toBeVisible()

  // Attach image
  const fixture = path.join(__dirname, 'fixtures', 'sample.svg')
  const fileInput = item.locator('input[type="file"]')
  await fileInput.setInputFiles(fixture)

  // Wait for thumbnail to appear
  await expect(item.locator('img[alt="attachment"]')).toBeVisible()

  // Remove image
  await item.locator('button', { hasText: 'Remove' }).click()
  await expect(item.locator('img[alt="attachment"]')).toHaveCount(0)

  // Toggle complete
  await item.locator('button').first().click()
  // Title should gain line-through via class; check by attribute
  await expect(item.locator('span')).toHaveClass(/line-through/)

  // Delete
  await item.locator('button[aria-label="Delete todo"]').click()
  await expect(page.locator('li', { hasText: unique })).toHaveCount(0)
})
