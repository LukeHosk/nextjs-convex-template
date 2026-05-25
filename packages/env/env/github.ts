import { createEnv } from '@t3-oss/env-nextjs'
import { seedEnv } from './base/seed'
import { automationEnv } from './base/automation'

export const githubEnv = createEnv({
  server: {},
  client: {},
  runtimeEnv: {},
  extends: [automationEnv, seedEnv],
})
