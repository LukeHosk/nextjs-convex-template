import { defineConfig, devices } from '@playwright/test'

// Avoid importing `@/env/next` here because it pulls ESM-only packages and
// causes Playwright's CommonJS loader to fail. Read needed env vars directly.
const env = {
  PLAYWRIGHT_BASE_URL: process.env.PLAYWRIGHT_BASE_URL,
  CI: process.env.CI,
  VERCEL_AUTOMATION_BYPASS_SECRET: process.env.VERCEL_AUTOMATION_BYPASS_SECRET,
}

// When set, tests run against a deployed URL instead of a local dev server.
const baseURL = env.PLAYWRIGHT_BASE_URL ?? 'http://localhost:3000'
const isRemote = !!env.PLAYWRIGHT_BASE_URL

export default defineConfig({
  testDir: './tests/e2e',
  fullyParallel: true,
  forbidOnly: !!env.CI,
  retries: env.CI ? 2 : 0,
  workers: env.CI ? 1 : undefined,
  reporter: env.CI ? 'github' : 'list',
  timeout: 60000,
  expect: { timeout: 20000 },
  use: {
    baseURL,
    trace: 'on-first-retry',
    navigationTimeout: 30000,
    actionTimeout: 15000,
    ...(env.VERCEL_AUTOMATION_BYPASS_SECRET && {
      extraHTTPHeaders: {
        'x-vercel-protection-bypass': env.VERCEL_AUTOMATION_BYPASS_SECRET,
      },
    }),
  },
  projects: [
    // Runs auth.setup.ts first; saves session to .auth/user.json
    {
      name: 'setup',
      testMatch: /auth\.setup\.ts/,
    },

    // Authenticated browser projects — depend on setup
    {
      name: 'chromium',
      use: {
        ...devices['Desktop Chrome'],
        storageState: 'tests/e2e/.auth/user.json',
      },
      dependencies: ['setup'],
      testIgnore: /auth\.spec\.ts/,
    },
    {
      name: 'webkit',
      use: {
        ...devices['Desktop Safari'],
        storageState: 'tests/e2e/.auth/user.json',
      },
      dependencies: ['setup'],
      testIgnore: /auth\.spec\.ts/,
    },
    {
      name: 'mobile-chrome',
      use: {
        ...devices['Pixel 5'],
        storageState: 'tests/e2e/.auth/user.json',
      },
      dependencies: ['setup'],
      testIgnore: /auth\.spec\.ts/,
    },

    // Unauthenticated project — only runs auth.spec.ts
    {
      name: 'chromium-auth',
      use: { ...devices['Desktop Chrome'] },
      testMatch: /auth\.spec\.ts/,
    },
  ],
  webServer: isRemote
    ? undefined
    : {
        command: 'pnpm --filter @repo/web dev',
        url: 'http://localhost:3000',
        reuseExistingServer: !env.CI,
      },
})
