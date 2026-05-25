'use client'

import { env } from '@/env/next'
import { ConvexAuthNextjsProvider } from '@convex-dev/auth/nextjs'
import { ConvexReactClient } from 'convex/react'
import { ReactNode } from 'react'

const convex = new ConvexReactClient(env.NEXT_PUBLIC_CONVEX_URL!)

export default function ConvexClientProvider({ children }: { children: ReactNode }) {
  return <ConvexAuthNextjsProvider client={convex}>{children}</ConvexAuthNextjsProvider>
}
