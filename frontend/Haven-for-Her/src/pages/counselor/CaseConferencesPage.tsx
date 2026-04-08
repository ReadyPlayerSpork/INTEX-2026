import { useCallback, useEffect, useState } from 'react'
import { counselorApi, type CaseConferenceDto } from '@/api/counselorApi'
import { Button } from '@/components/ui/button'

export function CaseConferencesPage() {
  const [conferences, setConferences] = useState<CaseConferenceDto[]>([])
  const [page, setPage] = useState(1)
  const [totalCount, setTotalCount] = useState(0)
  const [loading, setLoading] = useState(true)
  const [view, setView] = useState<'upcoming' | 'past'>('upcoming')
  const pageSize = 20

  const fetchConferences = useCallback(async () => {
    setLoading(true)
    try {
      const res = await counselorApi.getCaseConferences({ page, pageSize })
      setConferences(res.items)
      setTotalCount(res.totalCount)
    } catch {
      // ignore
    } finally {
      setLoading(false)
    }
  }, [page])

  useEffect(() => { void fetchConferences() }, [fetchConferences])

  const today = new Date().toISOString().split('T')[0]
  const filtered = conferences.filter((c) =>
    view === 'upcoming' ? c.caseConferenceDate >= today : c.caseConferenceDate < today,
  )
  const totalPages = Math.ceil(totalCount / pageSize)

  return (
    <div className="mx-auto max-w-7xl px-4 py-12">
      <h1 className="mb-6 font-heading text-2xl font-bold text-plum">Case Conferences</h1>

      <div className="mb-4 flex gap-2">
        <Button variant={view === 'upcoming' ? 'default' : 'outline'} size="sm" onClick={() => setView('upcoming')}>
          Upcoming
        </Button>
        <Button variant={view === 'past' ? 'default' : 'outline'} size="sm" onClick={() => setView('past')}>
          Past
        </Button>
      </div>

      {loading ? (
        <p className="text-muted-foreground animate-pulse">Loading...</p>
      ) : filtered.length === 0 ? (
        <p className="text-muted-foreground text-sm">No {view} conferences found.</p>
      ) : (
        <>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-border border-b text-left">
                  <th className="px-3 py-2 font-medium">Conference Date</th>
                  <th className="px-3 py-2 font-medium">Resident</th>
                  <th className="px-3 py-2 font-medium">Category</th>
                  <th className="px-3 py-2 font-medium">Description</th>
                  <th className="px-3 py-2 font-medium">Services</th>
                  <th className="px-3 py-2 font-medium">Status</th>
                  <th className="px-3 py-2 font-medium">Target Date</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map((c) => (
                  <tr key={c.planId} className="border-border border-b">
                    <td className="px-3 py-2 font-medium">{c.caseConferenceDate}</td>
                    <td className="px-3 py-2">{c.residentCode}</td>
                    <td className="px-3 py-2">{c.planCategory}</td>
                    <td className="max-w-xs truncate px-3 py-2">{c.planDescription}</td>
                    <td className="max-w-xs truncate px-3 py-2">{c.servicesProvided}</td>
                    <td className="px-3 py-2">{c.status}</td>
                    <td className="px-3 py-2">{c.targetDate}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {totalPages > 1 && (
            <div className="mt-4 flex items-center justify-between">
              <p className="text-muted-foreground text-sm">Page {page} of {totalPages} ({totalCount} total)</p>
              <div className="flex gap-2">
                <Button variant="outline" size="sm" disabled={page <= 1} onClick={() => setPage((p) => p - 1)}>Previous</Button>
                <Button variant="outline" size="sm" disabled={page >= totalPages} onClick={() => setPage((p) => p + 1)}>Next</Button>
              </div>
            </div>
          )}
        </>
      )}
    </div>
  )
}
