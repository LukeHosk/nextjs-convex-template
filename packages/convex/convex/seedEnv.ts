import { createEnv } from '@t3-oss/env-core'
import { z } from 'zod'

export const seedEnv = createEnv({
  server: {
    SEED_USER_EMAIL: z.email().default('test@example.test'),
    SEED_USER_PASSWORD: z.string().min(8).default('TestPass123!'),
    SEED_USER_2_EMAIL: z.email().default('test2@example.test'),
    SEED_USER_2_PASSWORD: z.string().min(8).default('TestPass123!'),
  },
  runtimeEnv: process.env,
})
