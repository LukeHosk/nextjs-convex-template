import { v } from 'convex/values'
import { mutation, query } from './_generated/server'
import { getAuthUserId } from '@convex-dev/auth/server'

export const generateUploadUrl = mutation({
  args: {},
  handler: async (ctx) => {
    const userId = await getAuthUserId(ctx)
    if (!userId) throw new Error('Not authenticated')
    return await ctx.storage.generateUploadUrl()
  },
})

export const getUrl = query({
  args: { storageId: v.id('_storage') },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx)
    if (!userId) return null
    return await ctx.storage.getUrl(args.storageId)
  },
})

export const recordUpload = mutation({
  args: {
    storageId: v.id('_storage'),
    name: v.optional(v.string()),
    width: v.optional(v.number()),
    height: v.optional(v.number()),
    fileSize: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx)
    if (!userId) throw new Error('Not authenticated')
    return await ctx.db.insert('uploadedImages', {
      storageId: args.storageId,
      uploadedBy: userId,
      ...(args.name !== undefined && { name: args.name }),
      ...(args.width !== undefined && { width: args.width }),
      ...(args.height !== undefined && { height: args.height }),
      ...(args.fileSize !== undefined && { fileSize: args.fileSize }),
    })
  },
})

export const deleteFile = mutation({
  args: { storageId: v.id('_storage') },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx)
    if (!userId) throw new Error('Not authenticated')
    const image = await ctx.db
      .query('uploadedImages')
      .withIndex('by_storage_id', (q) => q.eq('storageId', args.storageId))
      .unique()
    if (image) await ctx.db.delete(image._id)
    await ctx.storage.delete(args.storageId)
  },
})
