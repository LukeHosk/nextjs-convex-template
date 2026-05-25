import { createEnv } from '@t3-oss/env-core'
import { z } from 'zod'

export const authEnv = createEnv({
  server: {
    CONVEX_SITE_URL: z.url(),
  },
  runtimeEnv: process.env,
})
