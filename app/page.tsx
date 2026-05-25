'use client'

import { useState } from 'react'
import { useMutation, useQuery } from 'convex/react'
import { api } from '@/convex/_generated/api'
import SignOutButton from '@/components/SignOutButton'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Circle, CircleCheck, Trash2 } from 'lucide-react'
import type { Id } from '@/convex/_generated/dataModel'

export default function Home() {
  const todos = useQuery(api.todos.list)
  const createTodo = useMutation(api.todos.create)
  const toggleComplete = useMutation(api.todos.toggleComplete)
  const removeTodo = useMutation(api.todos.remove)
  const updateTodo = useMutation(api.todos.update)
  const generateUploadUrl = useMutation(api.storage.generateUploadUrl)
  const recordUpload = useMutation(api.storage.recordUpload)
  const attachImage = useMutation(api.todos.attachImage)
  const removeImage = useMutation(api.todos.removeImage)

  const [title, setTitle] = useState('')
  const [editingId, setEditingId] = useState<null | string>(null)
  const [editTitle, setEditTitle] = useState('')

  function hasImageUrl(t: unknown): t is { imageUrl: string } {
    return typeof t === 'object' && t !== null && 'imageUrl' in t && Boolean((t as any).imageUrl)
  }

  async function handleAdd(e: React.FormEvent) {
    e.preventDefault()
    const trimmed = title.trim()
    if (!trimmed) return
    await createTodo({ title: trimmed })
    setTitle('')
  }

  return (
    <div className="flex min-h-screen flex-col">
      <header className="flex items-center justify-between border-b px-6 py-4">
        <h1 className="text-xl font-semibold">My App</h1>
        <SignOutButton />
      </header>
      <main className="mx-auto w-full max-w-lg p-8">
        <form onSubmit={handleAdd} className="mb-6 flex gap-2">
          <Input
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="Add a todo..."
            className="flex-1"
          />
          <Button type="submit" disabled={!title.trim()}>
            Add
          </Button>
        </form>

        {todos === undefined ? (
          <p className="text-sm text-muted-foreground">Loading…</p>
        ) : todos.length === 0 ? (
          <p className="text-sm text-muted-foreground">No todos yet. Add one above.</p>
        ) : (
          <ul className="space-y-2">
            {todos.map((todo) => (
              <li key={todo._id} className="flex items-center gap-3 rounded-md border px-4 py-3">
                <button
                  type="button"
                  onClick={() => toggleComplete({ id: todo._id as Id<'todos'> })}
                  className="shrink-0 text-muted-foreground hover:text-primary"
                  aria-label={todo.completed ? 'Mark incomplete' : 'Mark complete'}
                >
                  {todo.completed ? (
                    <CircleCheck className="h-5 w-5 text-green-600" />
                  ) : (
                    <Circle className="h-5 w-5" />
                  )}
                </button>
                {editingId === (todo._id as string) ? (
                  <Input
                    autoFocus
                    value={editTitle}
                    onChange={(e) => setEditTitle(e.target.value)}
                    onBlur={async () => {
                      const trimmed = editTitle.trim()
                      if (trimmed && trimmed !== todo.title) {
                        try {
                          await updateTodo({ id: todo._id as Id<'todos'>, title: trimmed })
                        } catch (e) {
                          // swallow; server will surface errors elsewhere
                        }
                      }
                      setEditingId(null)
                    }}
                    onKeyDown={async (e) => {
                      if (e.key === 'Enter') {
                        e.preventDefault()
                        const trimmed = editTitle.trim()
                        if (trimmed && trimmed !== todo.title) {
                          await updateTodo({ id: todo._id as Id<'todos'>, title: trimmed })
                        }
                        setEditingId(null)
                      } else if (e.key === 'Escape') {
                        setEditingId(null)
                        setEditTitle('')
                      }
                    }}
                    className={`flex-1 text-sm ${todo.completed ? 'text-muted-foreground line-through' : ''}`}
                  />
                ) : (
                  <span
                    className={`flex-1 text-sm ${todo.completed ? 'text-muted-foreground line-through' : ''}`}
                    onDoubleClick={() => {
                      setEditingId(todo._id as string)
                      setEditTitle(todo.title)
                    }}
                  >
                    {todo.title}
                  </span>
                )}
                {/* Image display and upload */}
                <div className="ml-3 flex items-center gap-2">
                  {hasImageUrl(todo) ? (
                    <div className="flex items-center gap-2">
                      <img
                        src={todo.imageUrl}
                        alt="attachment"
                        className="h-12 w-12 rounded object-cover"
                      />
                      <button
                        type="button"
                        onClick={async () => {
                          try {
                            await removeImage({ id: todo._id as Id<'todos'> })
                          } catch (e) {}
                        }}
                        className="text-sm text-muted-foreground hover:text-destructive"
                      >
                        Remove
                      </button>
                    </div>
                  ) : (
                    <label className="cursor-pointer text-sm text-muted-foreground hover:text-primary">
                      <input
                        type="file"
                        accept="image/*"
                        onChange={async (e: React.ChangeEvent<HTMLInputElement>) => {
                          const input = e.currentTarget
                          const file = input.files?.[0]
                          if (!file) return
                          try {
                            const uploadUrl = await generateUploadUrl({})
                            const uploadRes = await fetch(uploadUrl, {
                              method: 'POST',
                              headers: { 'Content-Type': file.type },
                              body: file,
                            })
                            if (!uploadRes.ok) throw new Error('Upload failed')
                            const body = await uploadRes.json()
                            const storageId = body.storageId

                            // read image dimensions
                            let width: number | undefined
                            let height: number | undefined
                            try {
                              const img = new Image()
                              img.src = URL.createObjectURL(file)
                              await new Promise((res) => (img.onload = res))
                              width = img.width
                              height = img.height
                              URL.revokeObjectURL(img.src)
                            } catch (err) {}

                            await recordUpload({
                              storageId,
                              name: file.name,
                              width,
                              height,
                              fileSize: file.size,
                            })
                            await attachImage({ id: todo._id as Id<'todos'>, storageId })
                          } catch (err) {
                            // ignore for now
                          } finally {
                            // Clear the input value on the captured element (safe even if removed from DOM)
                            try {
                              input.value = ''
                            } catch (_) {}
                          }
                        }}
                        className="hidden"
                      />
                      Attach
                    </label>
                  )}
                </div>
                <button
                  type="button"
                  onClick={() => removeTodo({ id: todo._id as Id<'todos'> })}
                  className="shrink-0 text-muted-foreground hover:text-destructive"
                  aria-label="Delete todo"
                >
                  <Trash2 className="h-4 w-4" />
                </button>
              </li>
            ))}
          </ul>
        )}
      </main>
    </div>
  )
}
