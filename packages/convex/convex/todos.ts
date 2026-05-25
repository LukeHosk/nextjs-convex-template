import { getAuthUserId } from '@convex-dev/auth/server'
import { internalMutation, mutation, query } from './_generated/server'
import { v } from 'convex/values'

export const list = query({
  args: {},
  handler: async (ctx) => {
    const userId = await getAuthUserId(ctx)
    if (!userId) return []
    const todos = await ctx.db
      .query('todos')
      .withIndex('by_user', (q) => q.eq('userId', userId))
      .order('desc')
      .collect()

    // Resolve storage URLs for any attached images so the client can render them
    return await Promise.all(
      todos.map(async (t) => {
        if (t.imageStorageId) {
          const url = await ctx.storage.getUrl(t.imageStorageId)
          return { ...t, imageUrl: url }
        }
        return t
      }),
    )
  },
})

export const create = mutation({
  args: { title: v.string() },
  handler: async (ctx, { title }) => {
    const userId = await getAuthUserId(ctx)
    if (!userId) throw new Error('Not authenticated')
    return ctx.db.insert('todos', { userId, title, completed: false })
  },
})

export const toggleComplete = mutation({
  args: { id: v.id('todos') },
  handler: async (ctx, { id }) => {
    const userId = await getAuthUserId(ctx)
    if (!userId) throw new Error('Not authenticated')
    const todo = await ctx.db.get(id)
    if (!todo || todo.userId !== userId) throw new Error('Not found')
    await ctx.db.patch(id, { completed: !todo.completed })
  },
})

export const remove = mutation({
  args: { id: v.id('todos') },
  handler: async (ctx, { id }) => {
    const userId = await getAuthUserId(ctx)
    if (!userId) throw new Error('Not authenticated')
    const todo = await ctx.db.get(id)
    if (!todo || todo.userId !== userId) throw new Error('Not found')
    await ctx.db.delete(id)
  },
})

export const update = mutation({
  args: { id: v.id('todos'), title: v.string() },
  handler: async (ctx, { id, title }) => {
    const userId = await getAuthUserId(ctx)
    if (!userId) throw new Error('Not authenticated')
    const todo = await ctx.db.get(id)
    if (!todo || todo.userId !== userId) throw new Error('Not found')
    const trimmed = title.trim()
    if (!trimmed) throw new Error('Title cannot be empty')
    await ctx.db.patch(id, { title: trimmed })
  },
})

export const attachImage = mutation({
  args: { id: v.id('todos'), storageId: v.id('_storage') },
  handler: async (ctx, { id, storageId }) => {
    const userId = await getAuthUserId(ctx)
    if (!userId) throw new Error('Not authenticated')
    const todo = await ctx.db.get(id)
    if (!todo || todo.userId !== userId) throw new Error('Not found')
    await ctx.db.patch(id, { imageStorageId: storageId })
  },
})

export const removeImage = mutation({
  args: { id: v.id('todos') },
  handler: async (ctx, { id }) => {
    const userId = await getAuthUserId(ctx)
    if (!userId) throw new Error('Not authenticated')
    const todo = await ctx.db.get(id)
    if (!todo || todo.userId !== userId) throw new Error('Not found')
    if (todo.imageStorageId) {
      // delete storage file and unset field
      await ctx.storage.delete(todo.imageStorageId)
      await ctx.db.patch(id, { imageStorageId: undefined })
    }
  },
})

export const seedForUser = internalMutation({
  args: { userId: v.id('users') },
  handler: async (ctx, { userId }) => {
    const existing = await ctx.db
      .query('todos')
      .withIndex('by_user', (q) => q.eq('userId', userId))
      .first()
    if (existing) return
    const samples = [
      { title: 'Read the docs', completed: true },
      { title: 'Build something with Convex', completed: false },
      { title: 'Ship it', completed: false },
    ]
    for (const todo of samples) {
      await ctx.db.insert('todos', { userId, ...todo })
    }
  },
})
