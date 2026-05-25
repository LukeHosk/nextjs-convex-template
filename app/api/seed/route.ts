import { api } from '@/convex/_generated/api'
import { env } from '@/env/next'
import { fetchAction } from 'convex/nextjs'
import { type NextRequest } from 'next/server'

export const POST = async (request: NextRequest) => {
  console.log('[seed] POST /api/seed called')

  const seedSecret = env.SEED_SECRET
  if (!seedSecret) {
    console.error('[seed] SEED_SECRET env var is not set')
    return Response.json({ error: 'Seeding not configured' }, { status: 403 })
  }

  const authHeader = request.headers.get('authorization')
  if (authHeader !== `Bearer ${seedSecret}`) {
    console.error('[seed] Authorization header mismatch')
    return Response.json({ error: 'Unauthorized' }, { status: 401 })
  }

  console.log('[seed] Auth passed, calling seedAll action')
  try {
    const result = await fetchAction(api.seed.seedAll, {})
    console.log('[seed] seedAll result:', result)
    return Response.json(result)
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Unknown error'
    console.error('[seed] seedAll threw:', message)
    return Response.json({ error: message }, { status: 500 })
  }
}
