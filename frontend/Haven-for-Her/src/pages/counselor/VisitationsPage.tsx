import { useCallback, useEffect, useState } from 'react'
import { api } from '@/api/client'
import { Button } from '@/components/ui/button'
import type { PaginatedResponse } from '@/api/types'

interface Visitation {
  familyVisitationTrackingId: number
  residentId: number
  visitDate: string
  visitType: string
  locationVisited: string | null
  visitOutcome: string | null
  safetyConcernsNoted: boolean
  followUpNeeded: boolean
}

const EMPTY_FORM = {
  residentId: '',
  visitDate: '',
  visitType: '',
  locationVisited: '',
  familyMembersPresent: '',
  purpose: '',
  observations: '',
  familyCooperationLevel: '',
  safetyConcernsNoted: false,
  followUpNeeded: false,
  followUpNotes: '',
  visitOutcome: '',
}

export function VisitationsPage() {
  const [visits, setVisits] = useState<Visitation[]>([])
  const [page, setPage] = useState(1)
  const [totalCount, setTotalCount] = useState(0)
  const [loading, setLoading] = useState(true)
  const [showForm, setShowForm] = useState(false)
  const [form, setForm] = useState(EMPTY_FORM)
  const [submitting, setSubmitting] = useState(false)
  const pageSize = 20

  const fetchVisits = useCallback(async () => {
    setLoading(true)
    try {
      const qs = new URLSearchParams({ page: String(page), pageSize: String(pageSize) })
      const res = await api.get<PaginatedResponse<Visitation>>(`/api/counselor/visitations?${qs}`)
      setVisits(res.items)
      setTotalCount(res.totalCount)
    } catch {
      // ignore
    } finally {
      setLoading(false)
    }
  }, [page])

  useEffect(() => {
    void fetchVisits()
  }, [fetchVisits])

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
      await api.post('/api/counselor/visitations', {
        residentId: Number(form.residentId),
        visitDate: form.visitDate,
        visitType: form.visitType,
        locationVisited: form.locationVisited || null,
        familyMembersPresent: form.familyMembersPresent || null,
        purpose: form.purpose || null,
        observations: form.observations || null,
        familyCooperationLevel: form.familyCooperationLevel || null,
        safetyConcernsNoted: form.safetyConcernsNoted,
        followUpNeeded: form.followUpNeeded,
        followUpNotes: form.followUpNotes || null,
        visitOutcome: form.visitOutcome || null,
      })
      setForm(EMPTY_FORM)
      setShowForm(false)
      void fetchVisits()
    } catch {
      // ignore
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <div className="mx-auto max-w-7xl px-4 py-12">
      <div className="mb-6 flex items-center justify-between">
        <h1 className="text-2xl font-bold">Family Visitations</h1>
        <Button onClick={() => setShowForm((v) => !v)}>
          {showForm ? 'Cancel' : 'New Visitation'}
        </Button>
      </div>

      {showForm && (
        <form onSubmit={handleSubmit} className="bg-card border-border mb-6 rounded-lg border p-6">
          <h2 className="mb-4 text-lg font-semibold">New Visitation</h2>
          <div className="grid grid-cols-2 gap-4">
            <label className="block">
              <span className="text-sm font-medium">Resident ID</span>
              <input name="residentId" type="number" required value={form.residentId} onChange={handleChange} className="border-input bg-background mt-1 block w-full rounded-md border px-3 py-2 text-sm" />
            </label>
            <label className="block">
              <span className="text-sm font-medium">Visit Date</span>
              <input name="visitDate" type="date" required value={form.visitDate} onChange={handleChange} className="border-input bg-background mt-1 block w-full rounded-md border px-3 py-2 text-sm" />
            </label>
            <label className="block">
              <span className="text-sm font-medium">Visit Type</span>
              <input name="visitType" type="text" required value={form.visitType} onChange={handleChange} className="border-input bg-background mt-1 block w-full rounded-md border px-3 py-2 text-sm" />
            </label>
            <label className="block">
              <span className="text-sm font-medium">Location</span>
              <input name="locationVisited" type="text" value={form.locationVisited} onChange={handleChange} className="border-input bg-background mt-1 block w-full rounded-md border px-3 py-2 text-sm" />
            </label>
            <label className="block">
              <span className="text-sm font-medium">Family Members Present</span>
              <input name="familyMembersPresent" type="text" value={form.familyMembersPresent} onChange={handleChange} className="border-input bg-background mt-1 block w-full rounded-md border px-3 py-2 text-sm" />
            </label>
            <label className="block">
              <span className="text-sm font-medium">Purpose</span>
              <input name="purpose" type="text" value={form.purpose} onChange={handleChange} className="border-input bg-background mt-1 block w-full rounded-md border px-3 py-2 text-sm" />
            </label>
            <label className="block">
              <span className="text-sm font-medium">Cooperation Level</span>
              <input name="familyCooperationLevel" type="text" value={form.familyCooperationLevel} onChange={handleChange} className="border-input bg-background mt-1 block w-full rounded-md border px-3 py-2 text-sm" />
            </label>
            <label className="block">
              <span className="text-sm font-medium">Visit Outcome</span>
              <input name="visitOutcome" type="text" value={form.visitOutcome} onChange={handleChange} className="border-input bg-background mt-1 block w-full rounded-md border px-3 py-2 text-sm" />
            </label>
            <label className="col-span-2 block">
              <span className="text-sm font-medium">Observations</span>
              <textarea name="observations" rows={3} value={form.observations} onChange={handleChange} className="border-input bg-background mt-1 block w-full rounded-md border px-3 py-2 text-sm" />
            </label>
            <label className="flex items-center gap-2">
              <input name="safetyConcernsNoted" type="checkbox" checked={form.safetyConcernsNoted} onChange={handleChange} />
              <span className="text-sm">Safety Concerns Noted</span>
            </label>
            <label className="flex items-center gap-2">
              <input name="followUpNeeded" type="checkbox" checked={form.followUpNeeded} onChange={handleChange} />
              <span className="text-sm">Follow-Up Needed</span>
            </label>
            {form.followUpNeeded && (
              <label className="col-span-2 block">
                <span className="text-sm font-medium">Follow-Up Notes</span>
                <textarea name="followUpNotes" rows={2} value={form.followUpNotes} onChange={handleChange} className="border-input bg-background mt-1 block w-full rounded-md border px-3 py-2 text-sm" />
              </label>
            )}
          </div>
          <div className="mt-4">
            <Button type="submit" disabled={submitting}>
              {submitting ? 'Saving...' : 'Save Visitation'}
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
                  <th className="px-3 py-2 font-medium">Location</th>
                  <th className="px-3 py-2 font-medium">Outcome</th>
                  <th className="px-3 py-2 font-medium">Safety Concerns</th>
                  <th className="px-3 py-2 font-medium">Follow-Up</th>
                </tr>
              </thead>
              <tbody>
                {visits.map((v) => (
                  <tr key={v.familyVisitationTrackingId} className="border-border border-b">
                    <td className="px-3 py-2">{v.visitDate}</td>
                    <td className="px-3 py-2">{v.residentId}</td>
                    <td className="px-3 py-2">{v.visitType}</td>
                    <td className="px-3 py-2">{v.locationVisited ?? '-'}</td>
                    <td className="px-3 py-2">{v.visitOutcome ?? '-'}</td>
                    <td className="px-3 py-2">{v.safetyConcernsNoted ? 'Yes' : 'No'}</td>
                    <td className="px-3 py-2">{v.followUpNeeded ? 'Yes' : 'No'}</td>
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
