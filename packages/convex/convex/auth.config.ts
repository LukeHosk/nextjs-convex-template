import { AuthConfig } from 'convex/server'
import { authEnv } from './env'

export default {
  providers: [
    {
      domain: authEnv.CONVEX_SITE_URL,
      applicationID: 'convex',
    },
  ],
} satisfies AuthConfig
