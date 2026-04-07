import { useState, type FormEvent } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { authApi } from '@/api/authApi'
import { useAuth } from '@/hooks/useAuth'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { ApiError } from '@/api/client'

const PERSONAS = [
  { value: 'Donor', label: 'Donor / Supporter' },
  { value: 'Volunteer', label: 'Volunteer / Employee' },
  { value: 'Survivor', label: 'Survivor seeking resources' },
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
            Join Haven for Her with the role context that fits you best.
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
                <span className="text-sm font-semibold">
                  Password (14+ characters)
                </span>
                <Input
                  type="password"
                  required
                  minLength={14}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                />
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
                  Which best describes you?
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
                        className="accent-[oklch(0.528_0.094_139)]"
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
