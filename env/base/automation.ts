import { createEnv } from '@t3-oss/env-nextjs'
import { z } from 'zod'

export const automationEnv = createEnv({
  server: {
    PLAYWRIGHT_BASE_URL: z.url().optional().default('http://localhost:3000'),
    VERCEL_AUTOMATION_BYPASS_SECRET: z.string().optional(), //TODO: make required in CI
    CI: z.coerce.boolean().optional().default(false),
  },
  client: {},
  runtimeEnv: {
    PLAYWRIGHT_BASE_URL: process.env.PLAYWRIGHT_BASE_URL,
    VERCEL_AUTOMATION_BYPASS_SECRET: process.env.VERCEL_AUTOMATION_BYPASS_SECRET,
    CI: process.env.CI,
  },
})
