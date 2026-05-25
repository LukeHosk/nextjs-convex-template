import { internalQuery } from './_generated/server'
import { v } from 'convex/values'

export const getSeedUserAccount = internalQuery({
  args: { email: v.string() },
  handler: async (ctx, args) => {
    return await ctx.db
      .query('authAccounts')
      .withIndex('providerAndAccountId', (q) =>
        q.eq('provider', 'password').eq('providerAccountId', args.email),
      )
      .unique()
  },
})
