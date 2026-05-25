import { createEnv } from '@t3-oss/env-nextjs'
import { z } from 'zod'

export const convexBaseEnv = createEnv({
  server: {
    CONVEX_SITE_URL: z.url(),
  },
  client: {},
  runtimeEnv: {
    CONVEX_SITE_URL: process.env.CONVEX_SITE_URL,
  },
})
