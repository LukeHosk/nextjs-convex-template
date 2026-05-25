import { createEnv } from '@t3-oss/env-nextjs'
import { z } from 'zod'
import { automationEnv } from './base/automation'
import { seedEnv } from './base/seed'

export const env = createEnv({
  server: {
    CONVEX_URL: z.url(),
    CONVEX_SITE_URL: z.url(),
  },
  client: {
    NEXT_PUBLIC_CONVEX_URL: z.url(),
    NEXT_PUBLIC_CONVEX_SITE_URL: z.url(),
  },
  runtimeEnv: {
    CONVEX_URL: process.env.CONVEX_URL || process.env.NEXT_PUBLIC_CONVEX_URL,
    CONVEX_SITE_URL: process.env.CONVEX_SITE_URL || process.env.NEXT_PUBLIC_CONVEX_SITE_URL,
    NEXT_PUBLIC_CONVEX_URL: process.env.NEXT_PUBLIC_CONVEX_URL,
    NEXT_PUBLIC_CONVEX_SITE_URL: process.env.NEXT_PUBLIC_CONVEX_SITE_URL,
  },
  extends: [automationEnv, seedEnv],
})
