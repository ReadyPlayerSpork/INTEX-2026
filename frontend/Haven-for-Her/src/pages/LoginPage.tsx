import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { useLoginForm } from '@/features/public/login/useLoginForm'

export function LoginPage() {
  const {
    email,
    password,
    error,
    loading,
    googleAvailable,
    googleSignInUrl,
    onEmailChange,
    onPasswordChange,
    onSubmit,
  } = useLoginForm()

  return (
    <div className="px-5 py-16 md:px-10 md:py-24">
      <div className="mx-auto grid max-w-5xl gap-8 lg:grid-cols-[0.9fr_1.1fr] lg:items-center">
        <div className="space-y-5">
          <p className="text-muted-foreground text-sm font-semibold tracking-[0.18em] uppercase">
            Welcome back
          </p>
          <h1 className="font-heading text-balance text-[clamp(2.5rem,5vw,4.1rem)] font-semibold text-accent">
            Sign in to continue supporting, healing, or coordinating care.
          </h1>
          <p className="text-muted-foreground max-w-lg text-pretty leading-8">
            Your account gives you access to the parts of Haven for Her that are
            meant for you, whether that is donor history, staff tools, or
            survivor resources.
          </p>
        </div>

        <Card className="border-border/70 bg-card/95">
          <CardContent className="p-8">
            <h2 className="font-heading text-3xl font-semibold text-accent">
              Log in
            </h2>
            <p className="text-muted-foreground mt-2 text-sm leading-6">
              Use your email and password, or continue with Google.
            </p>

            {error && (
              <div className="bg-destructive/10 text-destructive mt-6 rounded-2xl border border-destructive/20 p-3 text-sm">
                {error}
              </div>
            )}

            <form onSubmit={onSubmit} className="mt-6 flex flex-col gap-4">
              <label className="flex flex-col gap-2">
                <span className="text-sm font-semibold">Email</span>
                <Input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => onEmailChange(e.target.value)}
                />
              </label>

              <label className="flex flex-col gap-2">
                <span className="text-sm font-semibold">Password</span>
                <Input
                  type="password"
                  required
                  value={password}
                  onChange={(e) => onPasswordChange(e.target.value)}
                />
              </label>

              <Button type="submit" disabled={loading} className="mt-2">
                {loading ? 'Signing in...' : 'Sign in'}
              </Button>
            </form>

            <div className="mt-6 text-center">
              {googleAvailable ? (
                <a
                  href={googleSignInUrl}
                  className="text-accent text-sm font-semibold underline underline-offset-4 transition-colors hover:text-primary"
                >
                  Sign in with Google
                </a>
              ) : (
                <p className="text-muted-foreground text-sm">
                  Google sign-in is not available in this environment.
                </p>
              )}
            </div>

            <p className="text-muted-foreground mt-4 text-center text-sm">
              Don&apos;t have an account?{' '}
              <a
                href="/register"
                className="text-accent font-semibold underline underline-offset-4"
              >
                Sign up
              </a>
            </p>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
