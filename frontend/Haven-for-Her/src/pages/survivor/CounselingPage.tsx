import { useCallback, useEffect, useState, type FormEvent } from 'react'
import { api } from '@/api/client'
import { ApiError } from '@/api/client'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'

interface CounselingRequest {
  id: number
  reason: string
  preferredDay: string | null
  preferredTimeOfDay: string | null
  notes: string | null
  status: string
  assignedCounselorEmail: string | null
  createdAtUtc: string
}

const DAYS = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday']
const TIMES = ['Morning', 'Afternoon', 'Evening']
const selectClassName =
  'border-input bg-background focus-visible:border-ring focus-visible:ring-ring/18 w-full rounded-lg border px-3 py-2 text-sm outline-none transition-[border-color,box-shadow] focus-visible:ring-4'

export function CounselingPage() {
  const [requests, setRequests] = useState<CounselingRequest[]>([])
  const [showForm, setShowForm] = useState(false)
  const [reason, setReason] = useState('')
  const [preferredDay, setPreferredDay] = useState('')
  const [preferredTime, setPreferredTime] = useState('')
  const [notes, setNotes] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const fetchRequests = useCallback(async () => {
    try {
      const data = await api.get<CounselingRequest[]>('/api/counseling/requests/mine')
      setRequests(data)
    } catch {
      // ignore
    }
  }, [])

  useEffect(() => {
    void fetchRequests()
  }, [fetchRequests])

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault()
    setError(null)
    setLoading(true)

    try {
      await api.post('/api/counseling/requests', {
        reason,
        preferredDay: preferredDay || null,
        preferredTimeOfDay: preferredTime || null,
        notes: notes || null,
      })
      setShowForm(false)
      setReason('')
      setPreferredDay('')
      setPreferredTime('')
      setNotes('')
      await fetchRequests()
    } catch (err) {
      if (err instanceof ApiError) setError(err.message)
      else setError('An unexpected error occurred.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="mx-auto max-w-4xl px-5 py-16 md:px-10 md:py-20">
      <div className="mb-6 flex items-center justify-between">
        <div>
          <p className="text-muted-foreground text-sm font-semibold tracking-[0.18em] uppercase">
            Survivor support
          </p>
          <h1 className="font-heading mt-2 text-4xl font-semibold text-accent">
            Counseling
          </h1>
        </div>
        <Button onClick={() => setShowForm(!showForm)}>
          {showForm ? 'Cancel' : 'Request counseling'}
        </Button>
      </div>

      {showForm && (
        <Card className="mb-8 border-border/70 bg-card/95">
          <CardContent className="p-6">
          <form onSubmit={handleSubmit}>
          <h2 className="font-heading mb-4 text-2xl font-semibold text-accent">
            New counseling request
          </h2>

          {error && (
            <div className="bg-destructive/10 text-destructive mb-4 rounded-md p-3 text-sm">
              {error}
            </div>
          )}

          <div className="flex flex-col gap-4">
            <label className="flex flex-col gap-1">
              <span className="text-sm font-medium">
                What would you like help with?
              </span>
              <Textarea
                required
                value={reason}
                onChange={(e) => setReason(e.target.value)}
                rows={3}
              />
            </label>

            <div className="grid gap-4 sm:grid-cols-2">
              <label className="flex flex-col gap-1">
                <span className="text-sm font-medium">Preferred day</span>
                <select
                  value={preferredDay}
                  onChange={(e) => setPreferredDay(e.target.value)}
                  className={selectClassName}
                >
                  <option value="">No preference</option>
                  {DAYS.map((d) => (
                    <option key={d} value={d}>{d}</option>
                  ))}
                </select>
              </label>

              <label className="flex flex-col gap-1">
                <span className="text-sm font-medium">Preferred time</span>
                <select
                  value={preferredTime}
                  onChange={(e) => setPreferredTime(e.target.value)}
                  className={selectClassName}
                >
                  <option value="">No preference</option>
                  {TIMES.map((t) => (
                    <option key={t} value={t}>{t}</option>
                  ))}
                </select>
              </label>
            </div>

            <label className="flex flex-col gap-1">
              <span className="text-muted-foreground text-sm">
                Additional notes (optional)
              </span>
              <Input
                type="text"
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
              />
            </label>

            <Button type="submit" disabled={loading}>
              {loading ? 'Submitting...' : 'Submit request'}
            </Button>
          </div>
        </form>
        </CardContent>
        </Card>
      )}

      {/* My requests */}
      <h2 className="mb-3 text-lg font-semibold">My requests</h2>
      {requests.length === 0 ? (
        <p className="text-muted-foreground text-sm">No counseling requests yet.</p>
      ) : (
        <div className="space-y-3">
          {requests.map((r) => (
            <div
              key={r.id}
              className="bg-card border-border/70 rounded-2xl border p-4"
            >
              <div className="flex items-start justify-between">
                <p className="text-sm font-medium">{r.reason}</p>
                <StatusBadge status={r.status} />
              </div>
              {r.preferredDay && (
                <p className="text-muted-foreground mt-1 text-xs">
                  Preferred: {r.preferredDay}
                  {r.preferredTimeOfDay ? `, ${r.preferredTimeOfDay}` : ''}
                </p>
              )}
              {r.assignedCounselorEmail && (
                <p className="text-muted-foreground mt-1 text-xs">
                  Counselor: {r.assignedCounselorEmail}
                </p>
              )}
              <p className="text-muted-foreground mt-1 text-xs">
                Submitted {new Date(r.createdAtUtc).toLocaleDateString()}
              </p>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}

function StatusBadge({ status }: { status: string }) {
  const colors: Record<string, string> = {
    Open: 'bg-secondary text-secondary-foreground',
    Assigned: 'bg-accent/12 text-accent',
    Completed: 'bg-primary/15 text-primary',
    Cancelled: 'bg-muted text-muted-foreground',
  }
  return (
    <span
      className={`rounded-full px-3 py-1 text-xs font-semibold ${colors[status] ?? 'bg-muted text-muted-foreground'}`}
    >
      {status}
    </span>
  )
}
