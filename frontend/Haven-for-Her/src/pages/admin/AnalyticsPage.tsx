import { useCallback, useEffect, useState } from 'react'
import { reportsApi, type ResidentOutcomes, type ReintegrationData, type AccomplishmentReport, type SafehouseMetric } from '@/api/reportsApi'
import { MetricCard } from '@/components/shared/MetricCard'

export function AnalyticsPage() {
  const [outcomes, setOutcomes] = useState<ResidentOutcomes | null>(null)
  const [reintegration, setReintegration] = useState<ReintegrationData | null>(null)
  const [accomplishment, setAccomplishment] = useState<AccomplishmentReport | null>(null)
  const [safehouseMetrics, setSafehouseMetrics] = useState<SafehouseMetric[]>([])
  const [loading, setLoading] = useState(true)
  const [year, setYear] = useState(new Date().getFullYear())

  const fetchAll = useCallback(async () => {
    setLoading(true)
    try {
      const [o, r, a, s] = await Promise.all([
        reportsApi.getResidentOutcomes(),
        reportsApi.getReintegration(),
        reportsApi.getAccomplishment(year),
        reportsApi.getSafehouseComparison(6),
      ])
      setOutcomes(o)
      setReintegration(r)
      setAccomplishment(a)
      setSafehouseMetrics(s)
    } catch {
      // ignore
    } finally {
      setLoading(false)
    }
  }, [year])

  useEffect(() => { void fetchAll() }, [fetchAll])

  if (loading) {
    return <div className="mx-auto max-w-7xl px-4 py-12"><p className="text-muted-foreground animate-pulse">Loading...</p></div>
  }

  return (
    <div className="mx-auto max-w-7xl px-4 py-12">
      <div className="mb-6 flex items-center justify-between">
        <h1 className="font-heading text-2xl font-bold text-plum">Reports & Analytics</h1>
        <label className="flex items-center gap-2 text-sm">
          <span className="text-soft-purple">Report Year:</span>
          <input
            type="number"
            value={year}
            onChange={(e) => setYear(Number(e.target.value))}
            className="border-input bg-background w-24 rounded-md border px-2 py-1 text-sm"
          />
        </label>
      </div>

      {/* Annual Accomplishment Report */}
      {accomplishment && (
        <section className="mb-8">
          <h2 className="mb-4 font-heading text-xl font-semibold text-plum">
            Annual Accomplishment Report ({accomplishment.year})
          </h2>

          {/* Summary Metrics */}
          <div className="mb-6 grid gap-4 sm:grid-cols-2 md:grid-cols-4">
            <MetricCard label="Beneficiaries Served" value={accomplishment.beneficiaries.totalResidents} />
            <MetricCard label="New Admissions" value={accomplishment.beneficiaries.newAdmissions} />
            <MetricCard label="Discharges" value={accomplishment.beneficiaries.discharges} />
            <MetricCard label="Reintegrations Completed" value={accomplishment.beneficiaries.reintegrationCompleted} />
          </div>

          {/* Services Provided */}
          <div className="mb-6 grid gap-4 md:grid-cols-3">
            <div className="rounded-2xl bg-cream p-5">
              <h3 className="mb-3 text-sm font-semibold uppercase text-soft-purple/70">Healing (Counseling)</h3>
              <p className="font-heading text-3xl font-semibold text-plum">{accomplishment.services.counselingSessions}</p>
              <p className="mt-1 text-sm text-soft-purple/70">sessions total</p>
              <div className="mt-3 space-y-1 text-sm text-soft-purple">
                <p>Individual: {accomplishment.services.individualSessions}</p>
                <p>Group: {accomplishment.services.groupSessions}</p>
              </div>
            </div>
            <div className="rounded-2xl bg-cream p-5">
              <h3 className="mb-3 text-sm font-semibold uppercase text-soft-purple/70">Caring (Visitations)</h3>
              <p className="font-heading text-3xl font-semibold text-plum">{accomplishment.services.homeVisitations}</p>
              <p className="mt-1 text-sm text-soft-purple/70">home visitations</p>
              <div className="mt-3 space-y-1 text-sm text-soft-purple">
                <p>Incidents: {accomplishment.services.incidents}</p>
                <p>Resolved: {accomplishment.services.resolvedIncidents}</p>
              </div>
            </div>
            <div className="rounded-2xl bg-cream p-5">
              <h3 className="mb-3 text-sm font-semibold uppercase text-soft-purple/70">Teaching (Interventions)</h3>
              <p className="font-heading text-3xl font-semibold text-plum">{accomplishment.services.interventions}</p>
              <p className="mt-1 text-sm text-soft-purple/70">intervention plans</p>
              {accomplishment.services.interventionsByCategory.length > 0 && (
                <div className="mt-3 space-y-1 text-sm text-soft-purple">
                  {accomplishment.services.interventionsByCategory.map((c) => (
                    <p key={c.category}>{c.category}: {c.count}</p>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Case Categories */}
          {accomplishment.beneficiaries.byCaseCategory.length > 0 && (
            <div className="mb-6 rounded-2xl bg-cream p-5">
              <h3 className="mb-3 text-sm font-semibold uppercase text-soft-purple/70">Beneficiaries by Case Category</h3>
              <div className="grid gap-3 sm:grid-cols-2 md:grid-cols-3">
                {accomplishment.beneficiaries.byCaseCategory.map((c) => (
                  <div key={c.category} className="flex justify-between text-sm">
                    <span className="text-soft-purple">{c.category}</span>
                    <span className="font-medium text-plum">{c.count}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Donation Summary */}
          <div className="grid gap-4 sm:grid-cols-2">
            <MetricCard label="Total Donations" value={accomplishment.donations.totalDonations} />
            <MetricCard label="Total Monetary Value" value={`PHP ${accomplishment.donations.totalMonetaryValue.toLocaleString()}`} />
          </div>
        </section>
      )}

      {/* Resident Outcomes */}
      {outcomes && (
        <section className="mb-8">
          <h2 className="mb-4 font-heading text-xl font-semibold text-plum">Resident Outcomes by Safehouse</h2>
          <div className="grid gap-6 md:grid-cols-2">
            {/* Education */}
            <div className="rounded-2xl bg-cream p-5">
              <h3 className="mb-3 text-sm font-semibold uppercase text-soft-purple/70">Education Progress</h3>
              {outcomes.educationBySafehouse.length === 0 ? (
                <p className="text-sm text-soft-purple/60">No data available.</p>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="border-b text-left"><th className="px-2 py-1">Safehouse</th><th className="px-2 py-1">Avg Progress</th><th className="px-2 py-1">Avg Attendance</th></tr>
                    </thead>
                    <tbody>
                      {outcomes.educationBySafehouse.map((e) => (
                        <tr key={e.safehouseId} className="border-b">
                          <td className="px-2 py-1">{e.safehouseName}</td>
                          <td className="px-2 py-1">{e.avgProgressPercent.toFixed(1)}%</td>
                          <td className="px-2 py-1">{e.avgAttendanceRate.toFixed(1)}%</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>

            {/* Health */}
            <div className="rounded-2xl bg-cream p-5">
              <h3 className="mb-3 text-sm font-semibold uppercase text-soft-purple/70">Health & Wellbeing</h3>
              {outcomes.healthBySafehouse.length === 0 ? (
                <p className="text-sm text-soft-purple/60">No data available.</p>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="border-b text-left"><th className="px-2 py-1">Safehouse</th><th className="px-2 py-1">Health</th><th className="px-2 py-1">Nutrition</th><th className="px-2 py-1">Sleep</th></tr>
                    </thead>
                    <tbody>
                      {outcomes.healthBySafehouse.map((h) => (
                        <tr key={h.safehouseId} className="border-b">
                          <td className="px-2 py-1">{h.safehouseName}</td>
                          <td className="px-2 py-1">{h.avgGeneralHealthScore.toFixed(1)}</td>
                          <td className="px-2 py-1">{h.avgNutritionScore.toFixed(1)}</td>
                          <td className="px-2 py-1">{h.avgSleepQualityScore.toFixed(1)}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          </div>
        </section>
      )}

      {/* Safehouse Comparison */}
      {safehouseMetrics.length > 0 && (
        <section className="mb-8">
          <h2 className="mb-4 font-heading text-xl font-semibold text-plum">Safehouse Performance (Last 6 Months)</h2>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-border border-b text-left">
                  <th className="px-3 py-2 font-medium">Safehouse</th>
                  <th className="px-3 py-2 font-medium">Month</th>
                  <th className="px-3 py-2 font-medium">Residents</th>
                  <th className="px-3 py-2 font-medium">Edu Progress</th>
                  <th className="px-3 py-2 font-medium">Health Score</th>
                  <th className="px-3 py-2 font-medium">Sessions</th>
                  <th className="px-3 py-2 font-medium">Visits</th>
                  <th className="px-3 py-2 font-medium">Incidents</th>
                </tr>
              </thead>
              <tbody>
                {safehouseMetrics.map((m) => (
                  <tr key={m.metricId} className="border-border border-b">
                    <td className="px-3 py-2">{m.safehouseName}</td>
                    <td className="px-3 py-2">{m.monthStart}</td>
                    <td className="px-3 py-2">{m.activeResidents}</td>
                    <td className="px-3 py-2">{m.avgEducationProgress.toFixed(1)}%</td>
                    <td className="px-3 py-2">{m.avgHealthScore.toFixed(1)}</td>
                    <td className="px-3 py-2">{m.processRecordingCount}</td>
                    <td className="px-3 py-2">{m.homeVisitationCount}</td>
                    <td className="px-3 py-2">{m.incidentCount}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>
      )}

      {/* Reintegration */}
      {reintegration && (
        <section className="mb-8">
          <h2 className="mb-4 font-heading text-xl font-semibold text-plum">Reintegration Success Rates</h2>
          <div className="grid gap-6 md:grid-cols-2">
            <div className="rounded-2xl bg-cream p-5">
              <h3 className="mb-3 text-sm font-semibold uppercase text-soft-purple/70">By Type</h3>
              {reintegration.byType.length === 0 ? (
                <p className="text-sm text-soft-purple/60">No data available.</p>
              ) : (
                <div className="space-y-3">
                  {reintegration.byType.map((t) => {
                    const successRate = t.total > 0 ? ((t.successful / t.total) * 100).toFixed(1) : '0'
                    return (
                      <div key={t.reintegrationType}>
                        <div className="flex justify-between text-sm">
                          <span className="text-soft-purple">{t.reintegrationType}</span>
                          <span className="font-medium text-plum">{successRate}% ({t.successful}/{t.total})</span>
                        </div>
                        <div className="mt-1 h-2 rounded-full bg-blush">
                          <div className="h-full rounded-full bg-sage transition-all duration-300" style={{ width: `${successRate}%` }} />
                        </div>
                      </div>
                    )
                  })}
                </div>
              )}
            </div>

            <div className="rounded-2xl bg-cream p-5">
              <h3 className="mb-3 text-sm font-semibold uppercase text-soft-purple/70">By Status</h3>
              {reintegration.byStatus.length === 0 ? (
                <p className="text-sm text-soft-purple/60">No data available.</p>
              ) : (
                <div className="space-y-2">
                  {reintegration.byStatus.map((s) => (
                    <div key={s.status} className="flex justify-between text-sm">
                      <span className="text-soft-purple">{s.status}</span>
                      <span className="font-medium text-plum">{s.count}</span>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </section>
      )}
    </div>
  )
}
