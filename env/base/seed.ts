import { createEnv } from '@t3-oss/env-nextjs'
import { z } from 'zod'

export const seedEnv = createEnv({
  server: {
    SEED_SECRET: z.string().optional(), //TODO: make required in CI

    SEED_USER_EMAIL: z.email().optional().default('test@clothes-tool.test'),
    SEED_USER_PASSWORD: z.string().min(8).optional().default('TestPass123!'),
    SEED_USER_2_EMAIL: z.email().optional().default('test2@clothes-tool.test'),
    SEED_USER_2_PASSWORD: z.string().min(8).optional().default('TestPass123!'),
  },
  client: {},
  runtimeEnv: {
    SEED_SECRET: process.env.SEED_SECRET,
    SEED_USER_EMAIL: process.env.SEED_USER_EMAIL,
    SEED_USER_PASSWORD: process.env.SEED_USER_PASSWORD,
    SEED_USER_2_EMAIL: process.env.SEED_USER_2_EMAIL,
    SEED_USER_2_PASSWORD: process.env.SEED_USER_2_PASSWORD,
  },
})
