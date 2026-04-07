import { useState, type FormEvent } from 'react'
import { Link } from 'react-router-dom'
import { api } from '@/api/client'
import { ApiError } from '@/api/client'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'

const DONATION_TYPES = [
  { value: 'Monetary', label: 'Monetary' },
  { value: 'InKind', label: 'In-Kind (goods/supplies)' },
  { value: 'Time', label: 'Time / Volunteering' },
  { value: 'Skills', label: 'Professional Skills' },
]

const selectClassName =
  'border-input bg-background focus-visible:border-ring focus-visible:ring-ring/18 w-full rounded-lg border px-3 py-2 text-sm outline-none transition-[border-color,box-shadow] focus-visible:ring-4'

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
      <div className="px-5 py-16 md:px-10 md:py-24">
        <Card className="mx-auto max-w-xl border-primary/20 bg-primary/7 text-center">
          <CardContent className="p-8">
            <h1 className="font-heading text-4xl font-semibold text-accent">
              Thank you
            </h1>
            <p className="text-muted-foreground mx-auto mt-4 max-w-md leading-7 text-pretty">
              Your donation has been recorded. Your generosity makes a real
              difference in the lives of survivors.
            </p>
            <Link to="/" className="mt-6 inline-flex">
              <Button>Back to Home</Button>
            </Link>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="px-5 py-16 md:px-10 md:py-24">
      <div className="mx-auto grid max-w-5xl gap-8 lg:grid-cols-[0.9fr_1.1fr]">
        <div className="space-y-5">
          <p className="text-muted-foreground text-sm font-semibold tracking-[0.18em] uppercase">
            Donor giving
          </p>
          <h1 className="font-heading text-balance text-[clamp(2.5rem,5vw,4rem)] font-semibold text-accent">
            Support care in the way that fits your capacity best.
          </h1>
          <p className="text-muted-foreground max-w-lg leading-8 text-pretty">
            Whether you give financially, donate goods, volunteer time, or
            contribute professional skills, every contribution strengthens the
            support network around survivors.
          </p>
          <Card className="border-border/70 bg-card/95">
            <CardContent className="p-6">
              <p className="font-semibold text-accent">Donating as you</p>
              <p className="text-muted-foreground mt-2 text-sm leading-6">
                This donation will be linked to your account so you can track
                your giving history and receive tax receipts.
              </p>
            </CardContent>
          </Card>
        </div>

        <Card className="border-border/70 bg-card/95">
          <CardContent className="p-8">
            <h2 className="font-heading text-3xl font-semibold text-accent">
              Make a donation
            </h2>

            {error && (
              <div className="bg-destructive/10 text-destructive mt-6 rounded-2xl border border-destructive/20 p-3 text-sm">
                {error}
              </div>
            )}

            <form onSubmit={handleSubmit} className="mt-6 flex flex-col gap-4">
              <label className="flex flex-col gap-2">
                <span className="text-sm font-semibold">Donation type</span>
                <select
                  value={donationType}
                  onChange={(e) => setDonationType(e.target.value)}
                  className={selectClassName}
                >
                  {DONATION_TYPES.map((t) => (
                    <option key={t.value} value={t.value}>
                      {t.label}
                    </option>
                  ))}
                </select>
              </label>

              {donationType === 'Monetary' && (
                <label className="flex flex-col gap-2">
                  <span className="text-sm font-semibold">Amount (PHP)</span>
                  <Input
                    type="number"
                    required
                    min="1"
                    step="0.01"
                    value={amount}
                    onChange={(e) => setAmount(e.target.value)}
                    placeholder="0.00"
                  />
                </label>
              )}

              <label className="flex flex-col gap-2">
                <span className="text-sm font-semibold">Campaign (optional)</span>
                <Input
                  type="text"
                  value={campaign}
                  onChange={(e) => setCampaign(e.target.value)}
                  placeholder="e.g. Holiday Giving 2026"
                />
              </label>

              <label className="flex flex-col gap-2">
                <span className="text-sm font-semibold">Notes (optional)</span>
                <Textarea
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  rows={3}
                />
              </label>

              <Button type="submit" disabled={loading} className="mt-2">
                {loading ? 'Processing...' : 'Donate'}
              </Button>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
