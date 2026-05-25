import { api, internal } from './_generated/api'
import { action, type ActionCtx } from './_generated/server'
import { seedEnv } from './seedEnv'

const SEED_USER_1_EMAIL = seedEnv.SEED_USER_EMAIL
const SEED_USER_1_PASSWORD = seedEnv.SEED_USER_PASSWORD
const SEED_USER_2_EMAIL = seedEnv.SEED_USER_2_EMAIL
const SEED_USER_2_PASSWORD = seedEnv.SEED_USER_2_PASSWORD

async function createUserIfMissing(ctx: ActionCtx, email: string, password: string): Promise<void> {
  const account = await ctx.runQuery(internal.users.getSeedUserAccount, { email })
  if (!account) {
    console.log(`Creating seed user: ${email}`)
    await ctx.runAction(api.auth.signIn, {
      provider: 'password',
      params: { flow: 'signUp', email, password },
    })
  } else {
    console.log(`Seed user already exists: ${email}`)
  }
}

export const seedTestUser = action({
  args: {},
  handler: async (ctx) => {
    await createUserIfMissing(ctx, SEED_USER_1_EMAIL, SEED_USER_1_PASSWORD)
    await createUserIfMissing(ctx, SEED_USER_2_EMAIL, SEED_USER_2_PASSWORD)
    return { seeded: true }
  },
})

export const seedAll = action({
  args: {},
  handler: async (ctx) => {
    await createUserIfMissing(ctx, SEED_USER_1_EMAIL, SEED_USER_1_PASSWORD)
    await createUserIfMissing(ctx, SEED_USER_2_EMAIL, SEED_USER_2_PASSWORD)

    const account1 = await ctx.runQuery(internal.users.getSeedUserAccount, {
      email: SEED_USER_1_EMAIL,
    })
    if (account1?.userId) {
      await ctx.runMutation(internal.todos.seedForUser, { userId: account1.userId })
    }

    return { seeded: true }
  },
})
