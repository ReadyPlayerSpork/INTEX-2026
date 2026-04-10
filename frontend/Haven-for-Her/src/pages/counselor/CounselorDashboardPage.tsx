import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { api } from '@/api/client'
import {
  getResidentAlerts,
  getResidentProgress,
  type IncidentRiskAlert,
  type ResidentProgressPrediction,
} from '@/api/mlApi'
import { cn } from '@/lib/utils'
import { StatCard } from '@/components/shared/StatCard'

/* ---------- Types matching CounselorController.GetDashboard ---------- */

interface AssignedResident {
  residentId: number
  caseControlNo: string
  internalCode: string
  caseStatus: string
  currentRiskLevel: string
  dateOfAdmission: string
  safehouseName: string
}

interface RecentSession {
  recordingId: number
  residentId: number
  sessionDate: string
  sessionType: string
  sessionDurationMinutes: number
  emotionalStateObserved: string
  emotionalStateEnd: string
  progressNoted: boolean
  concernsFlagged: boolean
}

interface CounselorDashboard {
  assignedResidents: AssignedResident[]
  recentSessions: RecentSession[]
  openRequests: number
}

function CounselorSkeleton() {
  return (
    <div className="mx-auto max-w-7xl animate-pulse space-y-8 px-5 py-16 md:px-10 md:py-20">
      <div className="space-y-2">
        <div className="bg-muted h-3 w-40 rounded-full" />
        <div className="bg-muted h-9 w-72 rounded-xl" />
        <div className="bg-muted h-4 w-80 rounded-lg" />
      </div>
      <div className="grid grid-cols-1 gap-6 sm:grid-cols-3">
        {Array.from({ length: 3 }).map((_, i) => (
          <div key={i} className="bg-muted h-24 rounded-2xl" />
        ))}
      </div>
      <div className="bg-muted h-48 rounded-2xl" />
      <div className="bg-muted h-64 rounded-2xl" />
      <div className="bg-muted h-64 rounded-2xl" />
    </div>
  )
}

export function CounselorDashboardPage() {
  const [data, setData] = useState<CounselorDashboard | null>(null)
  const [loading, setLoading] = useState(true)
  const [mlAlerts, setMlAlerts] = useState<IncidentRiskAlert[] | null>(null)
  const [progressMap, setProgressMap] = useState<
    Record<number, ResidentProgressPrediction>
  >({})

  useEffect(() => {
    api
      .get<CounselorDashboard>('/api/counselor/dashboard')
      .then((d) => {
        setData(d)
        // Batch ML progress predictions into a single Promise.all
        Promise.all(
          d.assignedResidents.map((r) =>
            getResidentProgress(r.residentId)
              .then(
                (pred) =>
                  (pred ? ([r.residentId, pred] as const) : null),
              )
              .catch(() => null),
          ),
        ).then((results) => {
          const map: Record<number, ResidentProgressPrediction> = {}
          for (const r of results) {
            if (r) map[r[0]] = r[1]
          }
          setProgressMap(map)
        })
      })
      .catch((err) =>
        console.error('Failed to load counselor dashboard', err),
      )
      .finally(() => setLoading(false))

    getResidentAlerts()
      .then(setMlAlerts)
      .catch(() => setMlAlerts([]))
  }, [])

  if (loading) return <CounselorSkeleton />

  if (!data) {
    return (
      <div className="mx-auto max-w-7xl px-5 py-16 md:px-10 md:py-20">
        <p className="text-muted-foreground">Unable to load dashboard.</p>
      </div>
    )
  }

  return (
    <div className="mx-auto max-w-7xl px-5 py-16 md:px-10 md:py-20">
      <div className="mb-8">
        <p className="text-muted-foreground text-sm font-semibold tracking-[0.18em] uppercase">
          Counselor portal
        </p>
        <h1 className="font-heading mt-2 text-4xl font-semibold text-accent">
          My Caseload
        </h1>
        <p className="text-muted-foreground mt-2 max-w-2xl text-sm leading-relaxed">
          ML surfaces escalation risk and reintegration readiness so you can
          prioritize sessions and follow-ups.
        </p>
      </div>

      {mlAlerts !== null && (
        <section className="mb-8">
          <h2 className="font-heading mb-3 text-lg font-semibold text-accent">
            ML risk alerts
          </h2>
          <p className="text-muted-foreground mb-3 text-sm">
            Residents flagged by the incident-risk model for elevated escalation
            probability.
          </p>
          {mlAlerts.length === 0 ? (
            <p className="text-muted-foreground border-border bg-card rounded-2xl border px-4 py-3 text-sm">
              No ML escalation flags for your assigned caseload right now.
            </p>
          ) : (
            <div className="overflow-x-auto rounded-2xl border border-border bg-card">
              <table className="w-full text-sm" aria-label="ML risk alerts">
                <thead>
                  <tr className="border-border border-b text-left">
                    <th scope="col" className="px-3 py-2 font-medium">
                      Resident
                    </th>
                    <th scope="col" className="px-3 py-2 font-medium">
                      Current Risk
                    </th>
                    <th scope="col" className="px-3 py-2 font-medium">
                      ML Escalation Prob.
                    </th>
                    <th scope="col" className="px-3 py-2 font-medium">
                      ML Risk
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {mlAlerts.slice(0, 8).map((a) => (
                    <tr key={a.residentId} className="border-border border-b">
                      <td className="px-3 py-2">{a.internalCode}</td>
                      <td className="px-3 py-2">{a.currentRiskLevel}</td>
                      <td className="px-3 py-2 tabular-nums">
                        {(a.escalationProbability * 100).toFixed(1)}%
                      </td>
                      <td className="px-3 py-2">
                        <span
                          className={cn(
                            'inline-block rounded-full px-2 py-0.5 text-xs font-semibold',
                            a.riskLevel === 'High'
                              ? 'bg-destructive/10 text-destructive'
                              : a.riskLevel === 'Medium'
                                ? 'bg-accent/10 text-accent'
                                : 'bg-primary/10 text-primary',
                          )}
                        >
                          {a.riskLevel}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </section>
      )}

      <div className="mb-8 grid grid-cols-1 gap-6 sm:grid-cols-3">
        <StatCard
          label="Assigned Residents"
          value={data.assignedResidents.length}
        />
        <StatCard
          label="Recent Sessions"
          value={data.recentSessions.length}
        />
        <StatCard label="Open Requests" value={data.openRequests} />
      </div>

      <section className="mb-8">
        <div className="mb-4 flex items-center justify-between">
          <h2 className="font-heading text-lg font-semibold text-accent">
            Assigned Residents
          </h2>
          <Link
            to="/counselor/sessions"
            className="text-primary text-sm underline"
          >
            View sessions
          </Link>
        </div>
        {data.assignedResidents.length === 0 ? (
          <p className="text-muted-foreground text-sm">
            No assigned residents.
          </p>
        ) : (
          <div className="overflow-x-auto rounded-2xl border border-border bg-card">
            <table
              className="w-full text-sm"
              aria-label="Assigned residents"
            >
              <thead>
                <tr className="border-border border-b text-left">
                  <th scope="col" className="px-3 py-2 font-medium">
                    Code
                  </th>
                  <th scope="col" className="px-3 py-2 font-medium">
                    Safehouse
                  </th>
                  <th scope="col" className="px-3 py-2 font-medium">
                    Risk Level
                  </th>
                  <th scope="col" className="px-3 py-2 font-medium">
                    Status
                  </th>
                  <th scope="col" className="px-3 py-2 font-medium">
                    Admitted
                  </th>
                  <th scope="col" className="px-3 py-2 font-medium">
                    ML Readiness
                  </th>
                </tr>
              </thead>
              <tbody>
                {data.assignedResidents.map((r) => (
                  <tr key={r.residentId} className="border-border border-b">
                    <td className="px-3 py-2">{r.internalCode}</td>
                    <td className="px-3 py-2">{r.safehouseName}</td>
                    <td className="px-3 py-2">{r.currentRiskLevel}</td>
                    <td className="px-3 py-2">{r.caseStatus}</td>
                    <td className="px-3 py-2">{r.dateOfAdmission}</td>
                    <td className="px-3 py-2 tabular-nums">
                      {progressMap[r.residentId] ? (
                        <span>
                          {(
                            progressMap[r.residentId].readinessScore * 100
                          ).toFixed(0)}
                          %
                        </span>
                      ) : (
                        <span className="text-muted-foreground text-xs">
                          --
                        </span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </section>

      <section>
        <h2 className="font-heading mb-4 text-lg font-semibold text-accent">
          Recent Sessions
        </h2>
        {data.recentSessions.length === 0 ? (
          <p className="text-muted-foreground text-sm">
            No recent sessions.
          </p>
        ) : (
          <div className="overflow-x-auto rounded-2xl border border-border bg-card">
            <table
              className="w-full text-sm"
              aria-label="Recent counseling sessions"
            >
              <thead>
                <tr className="border-border border-b text-left">
                  <th scope="col" className="px-3 py-2 font-medium">
                    Date
                  </th>
                  <th scope="col" className="px-3 py-2 font-medium">
                    Resident
                  </th>
                  <th scope="col" className="px-3 py-2 font-medium">
                    Type
                  </th>
                  <th scope="col" className="px-3 py-2 font-medium">
                    Duration (min)
                  </th>
                  <th scope="col" className="px-3 py-2 font-medium">
                    Progress
                  </th>
                  <th scope="col" className="px-3 py-2 font-medium">
                    Concerns
                  </th>
                </tr>
              </thead>
              <tbody>
                {data.recentSessions.map((s) => (
                  <tr key={s.recordingId} className="border-border border-b">
                    <td className="px-3 py-2">{s.sessionDate}</td>
                    <td className="px-3 py-2">#{s.residentId}</td>
                    <td className="px-3 py-2">{s.sessionType}</td>
                    <td className="px-3 py-2">
                      {s.sessionDurationMinutes}
                    </td>
                    <td className="px-3 py-2">
                      {s.progressNoted ? 'Yes' : 'No'}
                    </td>
                    <td className="px-3 py-2">
                      {s.concernsFlagged ? 'Yes' : 'No'}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </section>
    </div>
  )
}
