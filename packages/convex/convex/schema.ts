import { authTables } from '@convex-dev/auth/server'
import { defineSchema, defineTable } from 'convex/server'
import { v } from 'convex/values'

export default defineSchema({
  ...authTables,

  users: defineTable({
    name: v.optional(v.string()),
    image: v.optional(v.string()),
    email: v.optional(v.string()),
    emailVerificationTime: v.optional(v.number()),
    phone: v.optional(v.string()),
    phoneVerificationTime: v.optional(v.number()),
    isAnonymous: v.optional(v.boolean()),
  })
    .index('email', ['email'])
    .index('phone', ['phone']),

  uploadedImages: defineTable({
    storageId: v.id('_storage'),
    name: v.optional(v.string()),
    width: v.optional(v.number()),
    height: v.optional(v.number()),
    fileSize: v.optional(v.number()),
    uploadedBy: v.optional(v.id('users')),
  })
    .index('by_storage_id', ['storageId'])
    .index('name', ['name']),

  todos: defineTable({
    userId: v.id('users'),
    title: v.string(),
    completed: v.boolean(),
    imageStorageId: v.optional(v.id('_storage')),
  })
    .index('by_user', ['userId'])
    .index('by_user_completed', ['userId', 'completed'])
    .searchIndex('search_title', { searchField: 'title', filterFields: ['userId'] }),
})
