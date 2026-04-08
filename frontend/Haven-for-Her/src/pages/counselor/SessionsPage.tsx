import { useCallback, useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { api } from '@/api/client'
import { Button } from '@/components/ui/button'
import type { PaginatedResponse } from '@/api/types'

interface Session {
  recordingId: number
  processRecordingId: number
  residentId: number
  sessionDate: string
  sessionType: string
  sessionDurationMinutes: number
  emotionalStateObserved: string | null
  emotionalStateEnd: string | null
  concernsFlagged: boolean
}

const EMPTY_FORM = {
  residentId: '',
  sessionDate: '',
  sessionType: '',
  sessionDurationMinutes: '',
  emotionalStateObserved: '',
  emotionalStateEnd: '',
  sessionNarrative: '',
  interventionsApplied: '',
  followUpActions: '',
  progressNoted: false,
  concernsFlagged: false,
  referralMade: false,
}

export function SessionsPage() {
  const [sessions, setSessions] = useState<Session[]>([])
  const [page, setPage] = useState(1)
  const [totalCount, setTotalCount] = useState(0)
  const [loading, setLoading] = useState(true)
  const [showForm, setShowForm] = useState(false)
  const [form, setForm] = useState(EMPTY_FORM)
  const [submitting, setSubmitting] = useState(false)
  const [filterType, setFilterType] = useState('')
  const [filterDateFrom, setFilterDateFrom] = useState('')
  const [filterDateTo, setFilterDateTo] = useState('')
  const [filterConcernsOnly, setFilterConcernsOnly] = useState(false)
  const pageSize = 20

  const fetchSessions = useCallback(async () => {
    setLoading(true)
    try {
      const qs = new URLSearchParams({ page: String(page), pageSize: String(pageSize) })
      if (filterType) qs.set('sessionType', filterType)
      if (filterDateFrom) qs.set('dateFrom', filterDateFrom)
      if (filterDateTo) qs.set('dateTo', filterDateTo)
      if (filterConcernsOnly) qs.set('concernsOnly', 'true')
      const res = await api.get<PaginatedResponse<Session>>(`/api/counselor/sessions?${qs}`)
      setSessions(res.items)
      setTotalCount(res.totalCount)
    } catch {
      // ignore
    } finally {
      setLoading(false)
    }
  }, [page, filterType, filterDateFrom, filterDateTo, filterConcernsOnly])

  useEffect(() => {
    void fetchSessions()
  }, [fetchSessions])

  const totalPages = Math.ceil(totalCount / pageSize)

  function handleChange(e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) {
    const target = e.target
    const value = target instanceof HTMLInputElement && target.type === 'checkbox' ? target.checked : target.value
    setForm((prev) => ({ ...prev, [target.name]: value }))
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setSubmitting(true)
    try {
      await api.post('/api/counselor/sessions', {
        residentId: Number(form.residentId),
        sessionDate: form.sessionDate,
        sessionType: form.sessionType,
        sessionDurationMinutes: Number(form.sessionDurationMinutes),
        emotionalStateObserved: form.emotionalStateObserved || null,
        emotionalStateEnd: form.emotionalStateEnd || null,
        sessionNarrative: form.sessionNarrative || null,
        interventionsApplied: form.interventionsApplied || null,
        followUpActions: form.followUpActions || null,
        progressNoted: form.progressNoted,
        concernsFlagged: form.concernsFlagged,
        referralMade: form.referralMade,
      })
      setForm(EMPTY_FORM)
      setShowForm(false)
      void fetchSessions()
    } catch {
      // ignore
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <div className="mx-auto max-w-7xl px-4 py-12">
      <div className="mb-6 flex items-center justify-between">
        <h1 className="text-2xl font-bold">Counseling Sessions</h1>
        <Button onClick={() => setShowForm((v) => !v)}>
          {showForm ? 'Cancel' : 'New Session'}
        </Button>
      </div>

      {/* Filters */}
      <div className="mb-4 flex flex-wrap gap-3">
        <select value={filterType} onChange={(e) => { setFilterType(e.target.value); setPage(1) }} className="border-input bg-background rounded-md border px-3 py-2 text-sm">
          <option value="">All types</option>
          <option value="Individual">Individual</option>
          <option value="Group">Group</option>
        </select>
        <input type="date" placeholder="From" value={filterDateFrom} onChange={(e) => { setFilterDateFrom(e.target.value); setPage(1) }} className="border-input bg-background rounded-md border px-3 py-2 text-sm" />
        <input type="date" placeholder="To" value={filterDateTo} onChange={(e) => { setFilterDateTo(e.target.value); setPage(1) }} className="border-input bg-background rounded-md border px-3 py-2 text-sm" />
        <label className="flex items-center gap-2">
          <input type="checkbox" checked={filterConcernsOnly} onChange={(e) => { setFilterConcernsOnly(e.target.checked); setPage(1) }} />
          <span className="text-sm">Concerns only</span>
        </label>
      </div>

      {showForm && (
        <form onSubmit={handleSubmit} className="bg-card border-border mb-6 rounded-lg border p-6">
          <h2 className="mb-4 text-lg font-semibold">New Session</h2>
          <div className="grid grid-cols-2 gap-4">
            <label className="block">
              <span className="text-sm font-medium">Resident ID</span>
              <input name="residentId" type="number" required value={form.residentId} onChange={handleChange} className="border-input bg-background mt-1 block w-full rounded-md border px-3 py-2 text-sm" />
            </label>
            <label className="block">
              <span className="text-sm font-medium">Session Date</span>
              <input name="sessionDate" type="date" required value={form.sessionDate} onChange={handleChange} className="border-input bg-background mt-1 block w-full rounded-md border px-3 py-2 text-sm" />
            </label>
            <label className="block">
              <span className="text-sm font-medium">Session Type</span>
              <input name="sessionType" type="text" required value={form.sessionType} onChange={handleChange} className="border-input bg-background mt-1 block w-full rounded-md border px-3 py-2 text-sm" />
            </label>
            <label className="block">
              <span className="text-sm font-medium">Duration (minutes)</span>
              <input name="sessionDurationMinutes" type="number" required value={form.sessionDurationMinutes} onChange={handleChange} className="border-input bg-background mt-1 block w-full rounded-md border px-3 py-2 text-sm" />
            </label>
            <label className="block">
              <span className="text-sm font-medium">Emotional State (start)</span>
              <input name="emotionalStateObserved" type="text" value={form.emotionalStateObserved} onChange={handleChange} className="border-input bg-background mt-1 block w-full rounded-md border px-3 py-2 text-sm" />
            </label>
            <label className="block">
              <span className="text-sm font-medium">Emotional State (end)</span>
              <input name="emotionalStateEnd" type="text" value={form.emotionalStateEnd} onChange={handleChange} className="border-input bg-background mt-1 block w-full rounded-md border px-3 py-2 text-sm" />
            </label>
            <label className="col-span-2 block">
              <span className="text-sm font-medium">Session Narrative</span>
              <textarea name="sessionNarrative" rows={3} value={form.sessionNarrative} onChange={handleChange} className="border-input bg-background mt-1 block w-full rounded-md border px-3 py-2 text-sm" />
            </label>
            <label className="col-span-2 block">
              <span className="text-sm font-medium">Interventions Applied</span>
              <textarea name="interventionsApplied" rows={2} value={form.interventionsApplied} onChange={handleChange} className="border-input bg-background mt-1 block w-full rounded-md border px-3 py-2 text-sm" />
            </label>
            <label className="col-span-2 block">
              <span className="text-sm font-medium">Follow-Up Actions</span>
              <textarea name="followUpActions" rows={2} value={form.followUpActions} onChange={handleChange} className="border-input bg-background mt-1 block w-full rounded-md border px-3 py-2 text-sm" />
            </label>
            <label className="flex items-center gap-2">
              <input name="progressNoted" type="checkbox" checked={form.progressNoted} onChange={handleChange} />
              <span className="text-sm">Progress Noted</span>
            </label>
            <label className="flex items-center gap-2">
              <input name="concernsFlagged" type="checkbox" checked={form.concernsFlagged} onChange={handleChange} />
              <span className="text-sm">Concerns Flagged</span>
            </label>
            <label className="flex items-center gap-2">
              <input name="referralMade" type="checkbox" checked={form.referralMade} onChange={handleChange} />
              <span className="text-sm">Referral Made</span>
            </label>
          </div>
          <div className="mt-4">
            <Button type="submit" disabled={submitting}>
              {submitting ? 'Saving...' : 'Save Session'}
            </Button>
          </div>
        </form>
      )}

      {loading ? (
        <p className="text-muted-foreground animate-pulse">Loading...</p>
      ) : (
        <>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-border border-b text-left">
                  <th className="px-3 py-2 font-medium">Date</th>
                  <th className="px-3 py-2 font-medium">Resident ID</th>
                  <th className="px-3 py-2 font-medium">Type</th>
                  <th className="px-3 py-2 font-medium">Duration</th>
                  <th className="px-3 py-2 font-medium">Emotional Start</th>
                  <th className="px-3 py-2 font-medium">Emotional End</th>
                  <th className="px-3 py-2 font-medium">Concerns</th>
                </tr>
              </thead>
              <tbody>
                {sessions.map((s) => (
                  <tr key={s.recordingId ?? s.processRecordingId} className="border-border hover:bg-muted/50 border-b">
                    <td className="px-3 py-2">
                      <Link to={`/counselor/sessions/${s.recordingId ?? s.processRecordingId}`} className="text-primary underline">
                        {s.sessionDate}
                      </Link>
                    </td>
                    <td className="px-3 py-2">{s.residentId}</td>
                    <td className="px-3 py-2">{s.sessionType}</td>
                    <td className="px-3 py-2">{s.sessionDurationMinutes} min</td>
                    <td className="px-3 py-2">{s.emotionalStateObserved ?? '-'}</td>
                    <td className="px-3 py-2">{s.emotionalStateEnd ?? '-'}</td>
                    <td className="px-3 py-2">{s.concernsFlagged ? 'Yes' : 'No'}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {totalPages > 1 && (
            <div className="mt-4 flex items-center justify-between">
              <p className="text-muted-foreground text-sm">
                Page {page} of {totalPages} ({totalCount} records)
              </p>
              <div className="flex gap-2">
                <Button variant="outline" size="sm" disabled={page <= 1} onClick={() => setPage((p) => p - 1)}>
                  Previous
                </Button>
                <Button variant="outline" size="sm" disabled={page >= totalPages} onClick={() => setPage((p) => p + 1)}>
                  Next
                </Button>
              </div>
            </div>
          )}
        </>
      )}
    </div>
  )
}
