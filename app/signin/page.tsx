'use client'

import { useAuthActions } from '@convex-dev/auth/react'
import { useRouter } from 'next/navigation'
import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'

type Flow = 'signIn' | 'signUp'

export default function SignInPage() {
  const { signIn } = useAuthActions()
  const router = useRouter()
  const [flow, setFlow] = useState<Flow>('signIn')
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    setLoading(true)
    setError(null)
    const formData = new FormData(e.currentTarget)
    formData.set('flow', flow)
    try {
      await signIn('password', formData)
      router.push('/')
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Sign in failed')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="flex min-h-screen items-center justify-center p-4">
      <Card className="w-full max-w-sm">
        <CardHeader>
          <CardTitle>{flow === 'signIn' ? 'Sign in' : 'Create account'}</CardTitle>
          <CardDescription>
            {flow === 'signIn'
              ? 'Enter your details to access your wardrobe.'
              : 'Create an account to get started.'}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="flex flex-col gap-4">
            <div className="flex flex-col gap-1.5">
              <Label htmlFor="email">Email</Label>
              <Input id="email" name="email" type="email" placeholder="you@example.com" required />
            </div>
            <div className="flex flex-col gap-1.5">
              <Label htmlFor="password">Password</Label>
              <Input
                id="password"
                name="password"
                type="password"
                placeholder="••••••••"
                minLength={8}
                required
              />
              {flow === 'signUp' && (
                <p className="text-xs text-muted-foreground">At least 8 characters</p>
              )}
            </div>

            {error && (
              <p className="rounded-md border border-current/20 bg-current/5 px-3 py-2 text-sm text-destructive">
                {error}
              </p>
            )}

            <Button type="submit" disabled={loading} className="w-full">
              {loading ? 'Loading…' : flow === 'signIn' ? 'Sign in' : 'Sign up'}
            </Button>

            <p className="text-center text-sm text-muted-foreground">
              {flow === 'signIn' ? "Don't have an account? " : 'Already have an account? '}
              <button
                type="button"
                className="text-foreground underline underline-offset-2"
                onClick={() => {
                  setFlow(flow === 'signIn' ? 'signUp' : 'signIn')
                  setError(null)
                }}
              >
                {flow === 'signIn' ? 'Sign up' : 'Sign in'}
              </button>
            </p>
          </form>
        </CardContent>
      </Card>
    </div>
  )
}
