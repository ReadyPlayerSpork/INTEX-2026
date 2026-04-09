import { useEffect, useMemo, useState, type FormEvent } from 'react'
import { Link, useNavigate, useSearchParams } from 'react-router-dom'
import { authApi } from '@/api/authApi'
import { useAuth } from '@/hooks/useAuth'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { ApiError } from '@/api/client'
import { getGoogleSignInUrl } from '@/lib/auth'
import { safeReturnPath } from '@/features/public/login/useLoginForm'

const PERSONAS = [
  { value: 'Survivor', label: 'Seeking Help' },
  { value: 'Volunteer', label: 'a Volunteer' },
  { value: 'Donor', label: 'a Supporter or Donor' },
  { value: 'General', label: 'Just wanting to help' },
]

const selectClassName =
  'border-input bg-background focus-visible:border-ring focus-visible:ring-ring/18 w-full rounded-lg border px-3 py-2 text-sm outline-none transition-[border-color,box-shadow] focus-visible:ring-4'

const ACQUISITION_SOURCES = [
  { value: 'SocialMedia', label: 'Social media' },
  { value: 'SearchEngine', label: 'Search engine' },
  { value: 'WordOfMouth', label: 'Word of mouth' },
  { value: 'Event', label: 'Event' },
  { value: 'Partner', label: 'Partner organization' },
  { value: 'News', label: 'News / media' },
  { value: 'Other', label: 'Other' },
]

export function RegisterPage() {
  const navigate = useNavigate()
  const { refresh } = useAuth()

  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [persona, setPersona] = useState('')
  const [acquisitionSource, setAcquisitionSource] = useState('')
  const [acquisitionDetail, setAcquisitionDetail] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)
  const [googleAvailable, setGoogleAvailable] = useState(false)
  const [searchParams] = useSearchParams()
  const returnPath = searchParams.get('returnUrl')
  const safeNext = safeReturnPath(returnPath)

  const googleSignInUrl = useMemo(
    () => getGoogleSignInUrl(safeNext ?? '/'),
    [safeNext]
  )

  useEffect(() => {
    let active = true
    authApi
      .providers()
      .then((providers) => {
        if (active)
          setGoogleAvailable(
            providers.some((p) => p.name.toLowerCase() === 'google'),
          )
      })
      .catch(() => {
        if (active) setGoogleAvailable(false)
      })
    return () => { active = false }
  }, [])

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

    if (!persona) {
      setError('Please select which best describes you.')
      return
    }

    if (!acquisitionSource) {
      setError('Please tell us how you heard about us.')
      return
    }

    setLoading(true)

    try {
      await authApi.register({
        email,
        password,
        persona,
        acquisitionSource,
        acquisitionDetail: acquisitionDetail || undefined,
      })
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
    <div className="px-5 py-16 md:px-10 md:py-24">
      <div className="mx-auto grid max-w-6xl gap-8 lg:grid-cols-[0.92fr_1.08fr]">
        <div className="space-y-5">
          <p className="text-muted-foreground text-sm font-semibold tracking-[0.18em] uppercase">
            Create an account
          </p>
          <h1 className="font-heading text-balance text-[clamp(2.5rem,5vw,4rem)] font-semibold text-accent">
            Join Haven for Her to support women in need.
          </h1>
          <p className="text-muted-foreground max-w-lg leading-8 text-pretty">
            Every registered account can grow with the relationship. We use the
            details below to personalize navigation, understand how people find
            us, and improve support for donors, survivors, and volunteers.
          </p>
        </div>

        <Card className="border-border/70 bg-card/95">
          <CardContent className="p-8">
            <h2 className="font-heading text-3xl font-semibold text-accent">
              Sign up
            </h2>

            {error && (
              <div
                role="alert"
                className="bg-destructive/10 text-destructive mt-6 rounded-2xl border border-destructive/20 p-3 text-sm"
              >
                {error}
              </div>
            )}

            <form onSubmit={handleSubmit} className="mt-6 flex flex-col gap-4">
              <label className="flex flex-col gap-2">
                <span className="text-sm font-semibold">Email</span>
                <Input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                />
              </label>

              <label className="flex flex-col gap-2">
                <span className="text-sm font-semibold">Password</span>
                <Input
                  type="password"
                  required
                  minLength={14}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                />
                <div className="mt-1">
                  <div
                    className={`flex items-center gap-2 text-sm transition-colors ${
                      password.length >= 14
                        ? 'text-green-600 dark:text-green-500 font-medium'
                        : 'text-muted-foreground'
                    }`}
                  >
                    <div
                      className={`flex h-4 w-4 items-center justify-center rounded-full border transition-colors ${
                        password.length >= 14
                          ? 'border-transparent bg-green-600 dark:bg-green-500 text-white'
                          : 'border-muted-foreground/50 bg-background'
                      }`}
                    >
                      {password.length >= 14 && (
                        <svg
                          xmlns="http://www.w3.org/2000/svg"
                          width="10"
                          height="10"
                          viewBox="0 0 24 24"
                          fill="none"
                          stroke="currentColor"
                          strokeWidth="3.5"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                        >
                          <polyline points="20 6 9 17 4 12"></polyline>
                        </svg>
                      )}
                    </div>
                    At least 14 characters long
                  </div>
                </div>
              </label>

              <label className="flex flex-col gap-2">
                <span className="text-sm font-semibold">Confirm password</span>
                <Input
                  type="password"
                  required
                  minLength={14}
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                />
              </label>

              <fieldset className="flex flex-col gap-3">
                <legend className="text-sm font-semibold">
                  I am...
                </legend>
                <div className="grid gap-3">
                  {PERSONAS.map((p) => (
                    <label
                      key={p.value}
                      className="flex items-center gap-3 rounded-2xl border border-border/70 bg-background/80 px-4 py-3 text-sm"
                    >
                      <input
                        type="radio"
                        name="persona"
                        value={p.value}
                        checked={persona === p.value}
                        onChange={(e) => setPersona(e.target.value)}
                        className="accent-primary"
                      />
                      {p.label}
                    </label>
                  ))}
                </div>
              </fieldset>

              <label className="flex flex-col gap-2">
                <span className="text-sm font-semibold">
                  How did you hear about us?
                </span>
                <select
                  required
                  value={acquisitionSource}
                  onChange={(e) => setAcquisitionSource(e.target.value)}
                  className={selectClassName}
                >
                  <option value="">Select...</option>
                  {ACQUISITION_SOURCES.map((s) => (
                    <option key={s.value} value={s.value}>
                      {s.label}
                    </option>
                  ))}
                </select>
              </label>

              {acquisitionSource && (
                <label className="flex flex-col gap-2">
                  <span className="text-muted-foreground text-sm">
                    Any details? (optional)
                  </span>
                  <Input
                    type="text"
                    value={acquisitionDetail}
                    onChange={(e) => setAcquisitionDetail(e.target.value)}
                    placeholder='e.g. "Facebook ad about counseling"'
                  />
                </label>
              )}

              <Button type="submit" disabled={loading} className="mt-2">
                {loading ? 'Creating account...' : 'Sign up'}
              </Button>
            </form>

            <div className="mt-6 text-center">
              {googleAvailable ? (
                <a
                  href={googleSignInUrl}
                  target="_self"
                  className="text-accent text-sm font-semibold underline underline-offset-4 transition-colors hover:text-primary"
                >
                  Sign up with Google
                </a>
              ) : (
                <p className="text-muted-foreground text-sm">
                  Google sign-up is not available in this environment.
                </p>
              )}
            </div>

            <p className="text-muted-foreground mt-4 text-center text-sm">
              Already have an account?{' '}
              <Link
                to="/login"
                className="text-accent font-semibold underline underline-offset-4"
              >
                Log in
              </Link>
            </p>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
