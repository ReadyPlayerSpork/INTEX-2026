import { Button } from '@/components/ui/button'
import { useLoginForm } from '@/features/public/login/useLoginForm'

export function LoginPage() {
  const {
    email,
    password,
    error,
    loading,
    onEmailChange,
    onPasswordChange,
    onSubmit,
  } = useLoginForm()

  return (
    <div className="mx-auto max-w-sm px-4 py-16">
      <h1 className="mb-8 text-2xl font-bold">Log in</h1>

      {error && (
        <div className="bg-destructive/10 text-destructive mb-4 rounded-md p-3 text-sm">
          {error}
        </div>
      )}

      <form onSubmit={onSubmit} className="flex flex-col gap-4">
        <label className="flex flex-col gap-1">
          <span className="text-sm font-medium">Email</span>
          <input
            type="email"
            required
            value={email}
            onChange={(e) => onEmailChange(e.target.value)}
            className="border-input bg-background rounded-md border px-3 py-2 text-sm"
          />
        </label>

        <label className="flex flex-col gap-1">
          <span className="text-sm font-medium">Password</span>
          <input
            type="password"
            required
            value={password}
            onChange={(e) => onPasswordChange(e.target.value)}
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
