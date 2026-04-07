import { useState, type FormEvent } from 'react'
import { useNavigate } from 'react-router-dom'
import { authApi } from '@/api/authApi'
import { useAuth } from '@/contexts/AuthContext'
import { Button } from '@/components/ui/button'
import { ApiError } from '@/api/client'

export function RegisterPage() {
  const navigate = useNavigate()
  const { refresh } = useAuth()

  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault()
    setError(null)

    if (password !== confirmPassword) {
      setError('Passwords do not match.')
      return
    }

    if (password.length < 14) {
      setError('Password must be at least 14 characters.')
      return
    }

    setLoading(true)

    try {
      await authApi.register(email, password)
      // Auto-login after successful registration
      await authApi.login(email, password)
      await refresh()
      navigate('/')
    } catch (err) {
      if (err instanceof ApiError) {
        setError(err.message)
      } else {
        setError('An unexpected error occurred.')
      }
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="mx-auto max-w-sm px-4 py-16">
      <h1 className="mb-8 text-2xl font-bold">Create an account</h1>

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
          <span className="text-sm font-medium">Password (14+ characters)</span>
          <input
            type="password"
            required
            minLength={14}
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="border-input bg-background rounded-md border px-3 py-2 text-sm"
          />
        </label>

        <label className="flex flex-col gap-1">
          <span className="text-sm font-medium">Confirm password</span>
          <input
            type="password"
            required
            minLength={14}
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            className="border-input bg-background rounded-md border px-3 py-2 text-sm"
          />
        </label>

        <Button type="submit" disabled={loading}>
          {loading ? 'Creating account...' : 'Sign up'}
        </Button>
      </form>

      <p className="text-muted-foreground mt-4 text-center text-sm">
        Already have an account?{' '}
        <a href="/login" className="text-foreground underline">
          Log in
        </a>
      </p>
    </div>
  )
}
