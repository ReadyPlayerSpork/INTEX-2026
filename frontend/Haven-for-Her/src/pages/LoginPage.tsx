import { useState, type FormEvent } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'
import { authApi } from '@/api/authApi'
import { useAuth } from '@/contexts/AuthContext'
import { Button } from '@/components/ui/button'
import { ApiError } from '@/api/client'

export function LoginPage() {
  const navigate = useNavigate()
  const { refresh } = useAuth()
  const [searchParams] = useSearchParams()
  const externalError = searchParams.get('externalError')

  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState<string | null>(externalError)
  const [loading, setLoading] = useState(false)

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault()
    setError(null)
    setLoading(true)

    try {
      await authApi.login(email, password)
      await refresh()
      navigate('/')
    } catch (err) {
      if (err instanceof ApiError) {
        setError(err.status === 401 ? 'Invalid email or password.' : err.message)
      } else {
        setError('An unexpected error occurred.')
      }
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="mx-auto max-w-sm px-4 py-16">
      <h1 className="mb-8 text-2xl font-bold">Log in</h1>

      {error && (
        <div className="bg-destructive/10 text-destructive mb-4 rounded-md p-3 text-sm">
          {error}
        </div>
      )}

      <form onSubmit={handleSubmit} className="flex flex-col gap-4">
        <label className="flex flex-col gap-1">
          <span className="text-sm font-medium">Email</span>
          <input
            type="email"
            required
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="border-input bg-background rounded-md border px-3 py-2 text-sm"
          />
        </label>

        <label className="flex flex-col gap-1">
          <span className="text-sm font-medium">Password</span>
          <input
            type="password"
            required
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="border-input bg-background rounded-md border px-3 py-2 text-sm"
          />
        </label>

        <Button type="submit" disabled={loading}>
          {loading ? 'Signing in...' : 'Sign in'}
        </Button>
      </form>

      <div className="mt-6 text-center">
        <a
          href="/api/auth/external-login?provider=Google"
          className="text-sm underline"
        >
          Sign in with Google
        </a>
      </div>

      <p className="text-muted-foreground mt-4 text-center text-sm">
        Don't have an account?{' '}
        <a href="/register" className="text-foreground underline">
          Sign up
        </a>
      </p>
    </div>
  )
}
