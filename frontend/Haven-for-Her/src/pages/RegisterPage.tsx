import { useState, type FormEvent } from 'react'
import { useNavigate } from 'react-router-dom'
import { authApi } from '@/api/authApi'
import { useAuth } from '@/contexts/AuthContext'
import { Button } from '@/components/ui/button'
import { ApiError } from '@/api/client'

const PERSONAS = [
  { value: 'Donor', label: 'Donor / Supporter' },
  { value: 'Volunteer', label: 'Volunteer / Employee' },
  { value: 'Survivor', label: 'Survivor seeking resources' },
]

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

        <fieldset className="flex flex-col gap-1">
          <legend className="text-sm font-medium">Which best describes you?</legend>
          <div className="mt-1 flex flex-col gap-2">
            {PERSONAS.map((p) => (
              <label key={p.value} className="flex items-center gap-2 text-sm">
                <input
                  type="radio"
                  name="persona"
                  value={p.value}
                  checked={persona === p.value}
                  onChange={(e) => setPersona(e.target.value)}
                />
                {p.label}
              </label>
            ))}
          </div>
        </fieldset>

        <label className="flex flex-col gap-1">
          <span className="text-sm font-medium">How did you hear about us?</span>
          <select
            required
            value={acquisitionSource}
            onChange={(e) => setAcquisitionSource(e.target.value)}
            className="border-input bg-background rounded-md border px-3 py-2 text-sm"
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
          <label className="flex flex-col gap-1">
            <span className="text-muted-foreground text-sm">
              Any details? (optional)
            </span>
            <input
              type="text"
              value={acquisitionDetail}
              onChange={(e) => setAcquisitionDetail(e.target.value)}
              placeholder='e.g. "Facebook ad about counseling"'
              className="border-input bg-background rounded-md border px-3 py-2 text-sm"
            />
          </label>
        )}

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
