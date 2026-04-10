import { useEffect, useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import { counselorApi, type ResidentTimelineResponse } from '@/api/counselorApi'
import { Button } from '@/components/ui/button'

export function ResidentTimelinePage() {
  const { residentId } = useParams<{ residentId: string }>()
  const id = Number(residentId)

  if (!residentId || !Number.isFinite(id) || id <= 0) {
    return (
      <div className="mx-auto max-w-7xl px-5 py-16 md:px-10 md:py-20">
        <p className="text-muted-foreground">Invalid resident.</p>
        <Link to="/counselor/dashboard" className="text-primary mt-4 inline-block text-sm underline">
          Back to dashboard
        </Link>
      </div>
    )
  }

  return <ResidentTimelineLoaded residentId={id} />
}

function ResidentTimelineLoaded({ residentId }: { residentId: number }) {
  const [upcomingOnly, setUpcomingOnly] = useState(false)

  return (
    <div className="mx-auto max-w-7xl px-5 py-16 md:px-10 md:py-20">
      <div className="mb-8">
        <Link
          to="/counselor/dashboard"
          className="text-primary text-sm font-medium underline underline-offset-2"
        >
          ← Counselor dashboard
        </Link>
        <h1 className="font-heading mt-4 text-3xl font-semibold text-accent">
          Resident timeline
        </h1>
        <p className="text-muted-foreground mt-2 text-sm">
          Sessions, visitations, and case conferences for this resident.
        </p>
        <div className="mt-4 flex flex-wrap items-center gap-3">
          <Button
            type="button"
            variant={upcomingOnly ? 'default' : 'outline'}
            size="sm"
            onClick={() => setUpcomingOnly(true)}
          >
            Upcoming &amp; today
          </Button>
          <Button
            type="button"
            variant={!upcomingOnly ? 'default' : 'outline'}
            size="sm"
            onClick={() => setUpcomingOnly(false)}
          >
            Full history
          </Button>
        </div>
      </div>

      <ResidentTimelineFetcher
        key={`${residentId}-${upcomingOnly}`}
        residentId={residentId}
        upcomingOnly={upcomingOnly}
      />
    </div>
  )
}

function ResidentTimelineFetcher({
  residentId,
  upcomingOnly,
}: {
  residentId: number
  upcomingOnly: boolean
}) {
  const [data, setData] = useState<ResidentTimelineResponse | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    let cancelled = false
    counselorApi
      .getResidentTimeline(residentId, { upcomingOnly })
      .then((d) => {
        if (!cancelled) setData(d)
      })
      .catch(() => {
        if (!cancelled) {
          setError('Unable to load timeline. You may not have access to this resident.')
        }
      })
      .finally(() => {
        if (!cancelled) setLoading(false)
      })
    return () => {
      cancelled = true
    }
  }, [residentId, upcomingOnly])

  if (loading) {
    return <p className="text-muted-foreground animate-pulse">Loading timeline…</p>
  }

  if (error || !data) {
    return (
      <>
        <p className="text-muted-foreground">
          {error ?? 'Unable to load timeline. You may not have access to this resident.'}
        </p>
        <Link to="/counselor/dashboard" className="text-primary mt-4 inline-block text-sm underline">
          Back to dashboard
        </Link>
      </>
    )
  }

  return <ResidentTimelineTable data={data} />
}

function ResidentTimelineTable({ data }: { data: ResidentTimelineResponse }) {
  return (
    <>
      <p className="text-muted-foreground mb-6 text-sm">
        Case <strong>{data.caseControlNo}</strong> · Resident ID {data.residentId}
      </p>

      {data.events.length === 0 ? (
        <p className="text-muted-foreground text-sm">No events in this view.</p>
      ) : (
        <div className="overflow-x-auto rounded-2xl border border-border bg-card">
          <table className="w-full text-sm" aria-label="Resident timeline">
            <thead>
              <tr className="border-border border-b text-left">
                <th className="px-3 py-2 font-medium">Date</th>
                <th className="px-3 py-2 font-medium">Type</th>
                <th className="px-3 py-2 font-medium">Title</th>
                <th className="px-3 py-2 font-medium">Summary</th>
                <th className="px-3 py-2 font-medium">Status</th>
                <th className="px-3 py-2 font-medium">Detail</th>
              </tr>
            </thead>
            <tbody>
              {data.events.map((e, i) => (
                <tr key={`${e.eventType}-${e.eventDate}-${i}`} className="border-border border-b">
                  <td className="px-3 py-2 whitespace-nowrap tabular-nums">{e.eventDate}</td>
                  <td className="px-3 py-2">{e.eventType}</td>
                  <td className="px-3 py-2">{e.title}</td>
                  <td className="text-muted-foreground max-w-xs px-3 py-2">{e.summary ?? '—'}</td>
                  <td className="px-3 py-2">{e.status ?? '—'}</td>
                  <td className="px-3 py-2">
                    {e.detailPath ? (
                      <Link
                        to={e.detailPath}
                        className="text-primary underline underline-offset-2"
                      >
                        Open
                      </Link>
                    ) : (
                      '—'
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </>
  )
}
