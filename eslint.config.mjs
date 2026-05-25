import { defineConfig } from 'eslint/config'
import nextCoreWebVitals from 'eslint-config-next/core-web-vitals'
import nextTypescript from 'eslint-config-next/typescript'
import convexPlugin from '@convex-dev/eslint-plugin'

export default defineConfig([
  ...nextCoreWebVitals,
  ...nextTypescript,
  ...convexPlugin.configs.recommended,
  {
    ignores: ['env/**', 'convex/env.ts', 'convex/seedEnv.ts', 'scripts/**'],
    rules: {
      'no-restricted-syntax': [
        'error',
        {
          selector: 'MemberExpression[object.name="process"][property.name="env"]',
          message: 'Use env from @/env/next or convex/env.ts instead of process.env directly',
        },
      ],
    },
  },
])
