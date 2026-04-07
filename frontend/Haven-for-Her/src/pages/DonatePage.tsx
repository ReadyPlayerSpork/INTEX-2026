import { useState, type FormEvent } from 'react'
import { Link } from 'react-router-dom'
import { api } from '@/api/client'
import { ApiError } from '@/api/client'
import { Button } from '@/components/ui/button'

const DONATION_TYPES = [
  { value: 'Monetary', label: 'Monetary' },
  { value: 'InKind', label: 'In-Kind (goods/supplies)' },
  { value: 'Time', label: 'Time / Volunteering' },
  { value: 'Skills', label: 'Professional Skills' },
]

export function DonatePage() {
  const [donationType, setDonationType] = useState('Monetary')
  const [amount, setAmount] = useState('')
  const [campaign, setCampaign] = useState('')
  const [notes, setNotes] = useState('')
  const [loading, setLoading] = useState(false)
  const [success, setSuccess] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault()
    setError(null)
    setLoading(true)

    try {
      await api.post('/api/donations', {
        donationType,
        amount: donationType === 'Monetary' ? parseFloat(amount) : null,
        campaignName: campaign || null,
        notes: notes || null,
      })
      setSuccess(true)
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

  if (success) {
    return (
      <div className="mx-auto max-w-md px-4 py-16 text-center">
        <h1 className="mb-4 text-2xl font-bold">Thank you!</h1>
        <p className="text-muted-foreground mb-6">
          Your donation has been recorded. Your generosity makes a real
          difference in the lives of survivors.
        </p>
        <Link to="/">
          <Button>Back to Home</Button>
        </Link>
      </div>
    )
  }

  return (
    <div className="mx-auto max-w-md px-4 py-12">
      <h1 className="mb-2 text-2xl font-bold">Make a Donation</h1>
      <p className="text-muted-foreground mb-8 text-sm">
        Every contribution helps provide safety, care, and hope to survivors.{' '}
        <Link to="/donate/anonymous" className="underline">
          Donate without an account
        </Link>
      </p>

      {error && (
        <div className="bg-destructive/10 text-destructive mb-4 rounded-md p-3 text-sm">
          {error}
        </div>
      )}

      <form onSubmit={handleSubmit} className="flex flex-col gap-4">
        <label className="flex flex-col gap-1">
          <span className="text-sm font-medium">Donation type</span>
          <select
            value={donationType}
            onChange={(e) => setDonationType(e.target.value)}
            className="border-input bg-background rounded-md border px-3 py-2 text-sm"
          >
            {DONATION_TYPES.map((t) => (
              <option key={t.value} value={t.value}>
                {t.label}
              </option>
            ))}
          </select>
        </label>

        {donationType === 'Monetary' && (
          <label className="flex flex-col gap-1">
            <span className="text-sm font-medium">Amount (PHP)</span>
            <input
              type="number"
              required
              min="1"
              step="0.01"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              className="border-input bg-background rounded-md border px-3 py-2 text-sm"
              placeholder="0.00"
            />
          </label>
        )}

        <label className="flex flex-col gap-1">
          <span className="text-sm font-medium">Campaign (optional)</span>
          <input
            type="text"
            value={campaign}
            onChange={(e) => setCampaign(e.target.value)}
            className="border-input bg-background rounded-md border px-3 py-2 text-sm"
            placeholder="e.g. Holiday Giving 2026"
          />
        </label>

        <label className="flex flex-col gap-1">
          <span className="text-sm font-medium">Notes (optional)</span>
          <textarea
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            className="border-input bg-background rounded-md border px-3 py-2 text-sm"
            rows={3}
          />
        </label>

        <Button type="submit" disabled={loading}>
          {loading ? 'Processing...' : 'Donate'}
        </Button>
      </form>
    </div>
  )
}
