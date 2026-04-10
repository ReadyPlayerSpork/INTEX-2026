import { useCallback, useEffect, useState } from 'react'
import { reportsApi, type ResidentOutcomes, type ReintegrationData, type AccomplishmentReport, type SafehouseMetric } from '@/api/reportsApi'
import { MetricCard } from '@/components/shared/MetricCard'
import { BookOpen, Heart, Home, RefreshCw, TrendingUp, Users } from 'lucide-react'

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
    return (
      <div className="mx-auto max-w-6xl px-0 pb-8">
        <div className="flex items-center gap-3 py-16">
          <RefreshCw className="text-primary size-4 animate-spin" />
          <p className="text-muted-foreground animate-pulse text-sm">Loading reports…</p>
        </div>
      </div>
    )
  }

  return (
    <div className="mx-auto max-w-6xl space-y-8 px-0 pb-8">

      {/* Page header */}
      <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
        <div>
          <p className="text-muted-foreground text-xs font-bold uppercase tracking-[0.18em]">
            Admin · Reports
          </p>
          <h1 className="font-heading text-accent mt-1 text-3xl font-semibold tracking-tight md:text-4xl">
            Reports &amp; Analytics
          </h1>
          <p className="text-muted-foreground mt-1 text-sm">
            Annual accomplishments, resident outcomes, and safehouse performance
          </p>
        </div>

        <label className="flex items-center gap-2 text-sm shrink-0">
          <span className="text-muted-foreground font-medium">Report year:</span>
          <input
            type="number"
            value={year}
            onChange={(e) => setYear(Number(e.target.value))}
            className="border-input bg-background focus:ring-primary w-24 rounded-lg border px-2 py-1.5 text-sm focus:outline-none focus:ring-2"
          />
        </label>
      </div>

      {/* ── Annual Accomplishment Report ───────────────────────────── */}
      {accomplishment && (
        <section className="space-y-5">
          <div>
            <p className="text-muted-foreground mb-1 text-xs font-bold uppercase tracking-[0.18em]">
              Annual Report
            </p>
            <h2 className="font-heading text-card-foreground text-xl font-semibold">
              {accomplishment.year} Accomplishment Report
            </h2>
          </div>

          {/* Beneficiary summary */}
          <div className="grid gap-4 sm:grid-cols-2 md:grid-cols-4">
            <MetricCard label="Beneficiaries Served" value={accomplishment.beneficiaries.totalResidents} />
            <MetricCard label="New Admissions" value={accomplishment.beneficiaries.newAdmissions} />
            <MetricCard label="Discharges" value={accomplishment.beneficiaries.discharges} />
            <MetricCard label="Reintegrations Completed" value={accomplishment.beneficiaries.reintegrationCompleted} />
          </div>

          {/* Three service pillars */}
          <div className="grid gap-4 md:grid-cols-3">
            {/* Counseling */}
            <div className="rounded-2xl border border-border bg-card p-5 shadow-bloom">
              <div className="mb-3 flex items-center gap-2">
                <div className="flex size-8 items-center justify-center rounded-full bg-primary/10">
                  <BookOpen className="text-primary size-4" />
                </div>
                <h3 className="text-muted-foreground text-xs font-bold uppercase tracking-wider">
                  Healing (Counseling)
                </h3>
              </div>
              <p className="font-heading text-accent text-3xl font-semibold tabular-nums">
                {accomplishment.services.counselingSessions}
              </p>
              <p className="text-muted-foreground mt-0.5 text-sm">sessions total</p>
              <div className="mt-4 space-y-1.5 text-sm">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Individual</span>
                  <span className="text-card-foreground font-semibold tabular-nums">{accomplishment.services.individualSessions}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Group</span>
                  <span className="text-card-foreground font-semibold tabular-nums">{accomplishment.services.groupSessions}</span>
                </div>
              </div>
            </div>

            {/* Visitations */}
            <div className="rounded-2xl border border-border bg-card p-5 shadow-bloom">
              <div className="mb-3 flex items-center gap-2">
                <div className="flex size-8 items-center justify-center rounded-full bg-accent/10">
                  <Heart className="text-accent size-4" />
                </div>
                <h3 className="text-muted-foreground text-xs font-bold uppercase tracking-wider">
                  Caring (Visitations)
                </h3>
              </div>
              <p className="font-heading text-accent text-3xl font-semibold tabular-nums">
                {accomplishment.services.homeVisitations}
              </p>
              <p className="text-muted-foreground mt-0.5 text-sm">home visitations</p>
              <div className="mt-4 space-y-1.5 text-sm">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Incidents</span>
                  <span className="text-card-foreground font-semibold tabular-nums">{accomplishment.services.incidents}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Resolved</span>
                  <span className="text-primary font-semibold tabular-nums">{accomplishment.services.resolvedIncidents}</span>
                </div>
              </div>
            </div>

            {/* Interventions */}
            <div className="rounded-2xl border border-border bg-card p-5 shadow-bloom">
              <div className="mb-3 flex items-center gap-2">
                <div className="flex size-8 items-center justify-center rounded-full bg-[var(--chart-3)]/10">
                  <Users className="size-4 text-[var(--chart-3)]" />
                </div>
                <h3 className="text-muted-foreground text-xs font-bold uppercase tracking-wider">
                  Teaching (Interventions)
                </h3>
              </div>
              <p className="font-heading text-accent text-3xl font-semibold tabular-nums">
                {accomplishment.services.interventions}
              </p>
              <p className="text-muted-foreground mt-0.5 text-sm">intervention plans</p>
              {accomplishment.services.interventionsByCategory.length > 0 && (
                <div className="mt-4 space-y-1.5 text-sm">
                  {accomplishment.services.interventionsByCategory.map((c) => (
                    <div key={c.category} className="flex justify-between">
                      <span className="text-muted-foreground">{c.category}</span>
                      <span className="text-card-foreground font-semibold tabular-nums">{c.count}</span>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Case categories + donation summary */}
          <div className="grid gap-4 md:grid-cols-2">
            {accomplishment.beneficiaries.byCaseCategory.length > 0 && (
              <div className="rounded-2xl border border-border bg-card p-5 shadow-bloom">
                <h3 className="text-muted-foreground mb-4 text-xs font-bold uppercase tracking-wider">
                  Beneficiaries by Case Category
                </h3>
                <div className="space-y-2">
                  {accomplishment.beneficiaries.byCaseCategory.map((c) => (
                    <div key={c.category} className="flex items-center justify-between text-sm">
                      <span className="text-card-foreground">{c.category}</span>
                      <span className="text-muted-foreground font-semibold tabular-nums">{c.count}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            <div className="rounded-2xl border border-border bg-card p-5 shadow-bloom">
              <div className="mb-4 flex items-center gap-2">
                <div className="flex size-8 items-center justify-center rounded-full bg-primary/10">
                  <TrendingUp className="text-primary size-4" />
                </div>
                <h3 className="text-muted-foreground text-xs font-bold uppercase tracking-wider">
                  Donation Summary ({accomplishment.year})
                </h3>
              </div>
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-muted-foreground text-sm">Total donations</span>
                  <span className="text-card-foreground font-heading text-lg font-semibold tabular-nums">
                    {accomplishment.donations.totalDonations}
                  </span>
                </div>
                <div className="border-t border-border pt-3 flex items-center justify-between">
                  <span className="text-muted-foreground text-sm">Monetary value</span>
                  <span className="text-primary font-heading text-lg font-semibold tabular-nums">
                    ${accomplishment.donations.totalMonetaryValue.toLocaleString()}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </section>
      )}

      {/* ── Resident Outcomes by Safehouse ────────────────────────── */}
      {outcomes && (
        <section className="space-y-4">
          <div>
            <p className="text-muted-foreground mb-1 text-xs font-bold uppercase tracking-[0.18em]">
              Resident Outcomes
            </p>
            <h2 className="font-heading text-card-foreground text-xl font-semibold">
              Outcomes by Safehouse
            </h2>
          </div>

          <div className="grid gap-4 md:grid-cols-2">
            {/* Education */}
            <div className="rounded-2xl border border-border bg-card p-5 shadow-bloom">
              <h3 className="text-muted-foreground mb-4 text-xs font-bold uppercase tracking-wider">
                Education Progress
              </h3>
              {outcomes.educationBySafehouse.length === 0 ? (
                <p className="text-muted-foreground text-sm">No data available.</p>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="border-b border-border text-left">
                        <th className="text-muted-foreground pb-2 pr-3 text-xs font-bold uppercase tracking-wide">Safehouse</th>
                        <th className="text-muted-foreground pb-2 pr-3 text-xs font-bold uppercase tracking-wide">Avg Progress</th>
                        <th className="text-muted-foreground pb-2 text-xs font-bold uppercase tracking-wide">Avg Attendance</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-border">
                      {outcomes.educationBySafehouse.map((e) => (
                        <tr key={e.safehouseId}>
                          <td className="text-card-foreground py-2.5 pr-3 font-medium">{e.safehouseName}</td>
                          <td className="text-muted-foreground py-2.5 pr-3 tabular-nums">{e.avgProgressPercent.toFixed(1)}%</td>
                          <td className="text-muted-foreground py-2.5 tabular-nums">{e.avgAttendanceRate.toFixed(1)}%</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>

            {/* Health */}
            <div className="rounded-2xl border border-border bg-card p-5 shadow-bloom">
              <h3 className="text-muted-foreground mb-4 text-xs font-bold uppercase tracking-wider">
                Health &amp; Wellbeing
              </h3>
              {outcomes.healthBySafehouse.length === 0 ? (
                <p className="text-muted-foreground text-sm">No data available.</p>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="border-b border-border text-left">
                        <th className="text-muted-foreground pb-2 pr-3 text-xs font-bold uppercase tracking-wide">Safehouse</th>
                        <th className="text-muted-foreground pb-2 pr-3 text-xs font-bold uppercase tracking-wide">Health</th>
                        <th className="text-muted-foreground pb-2 pr-3 text-xs font-bold uppercase tracking-wide">Nutrition</th>
                        <th className="text-muted-foreground pb-2 text-xs font-bold uppercase tracking-wide">Sleep</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-border">
                      {outcomes.healthBySafehouse.map((h) => (
                        <tr key={h.safehouseId}>
                          <td className="text-card-foreground py-2.5 pr-3 font-medium">{h.safehouseName}</td>
                          <td className="text-muted-foreground py-2.5 pr-3 tabular-nums">{h.avgGeneralHealthScore.toFixed(1)}</td>
                          <td className="text-muted-foreground py-2.5 pr-3 tabular-nums">{h.avgNutritionScore.toFixed(1)}</td>
                          <td className="text-muted-foreground py-2.5 tabular-nums">{h.avgSleepQualityScore.toFixed(1)}</td>
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

      {/* ── Safehouse Performance Table ───────────────────────────── */}
      {safehouseMetrics.length > 0 && (
        <section className="space-y-4">
          <div>
            <p className="text-muted-foreground mb-1 text-xs font-bold uppercase tracking-[0.18em]">
              Safehouse Performance
            </p>
            <h2 className="font-heading text-card-foreground text-xl font-semibold">
              Month-by-Month (Last 6 Months)
            </h2>
          </div>

          <div className="rounded-2xl border border-border bg-card p-5 shadow-bloom">
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-border text-left">
                    {['Safehouse', 'Month', 'Residents', 'Edu Progress', 'Health Score', 'Sessions', 'Visits', 'Incidents'].map((h) => (
                      <th key={h} className="text-muted-foreground pb-3 pr-4 text-xs font-bold uppercase tracking-wide last:pr-0">
                        {h}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y divide-border">
                  {safehouseMetrics.map((m) => (
                    <tr key={m.metricId} className="motion-safe:transition-colors motion-safe:hover:bg-muted/40">
                      <td className="text-card-foreground py-2.5 pr-4 font-medium">
                        <span className="flex items-center gap-1.5">
                          <Home className="text-muted-foreground size-3 shrink-0" />
                          {m.safehouseName}
                        </span>
                      </td>
                      <td className="text-muted-foreground py-2.5 pr-4 tabular-nums">{m.monthStart}</td>
                      <td className="text-card-foreground py-2.5 pr-4 tabular-nums font-semibold">{m.activeResidents}</td>
                      <td className="text-muted-foreground py-2.5 pr-4 tabular-nums">{m.avgEducationProgress.toFixed(1)}%</td>
                      <td className="text-muted-foreground py-2.5 pr-4 tabular-nums">{m.avgHealthScore.toFixed(1)}</td>
                      <td className="text-muted-foreground py-2.5 pr-4 tabular-nums">{m.processRecordingCount}</td>
                      <td className="text-muted-foreground py-2.5 pr-4 tabular-nums">{m.homeVisitationCount}</td>
                      <td className={`py-2.5 tabular-nums font-semibold ${m.incidentCount > 0 ? 'text-destructive' : 'text-muted-foreground'}`}>
                        {m.incidentCount}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </section>
      )}

      {/* ── Reintegration Success Rates ───────────────────────────── */}
      {reintegration && (
        <section className="space-y-4">
          <div>
            <p className="text-muted-foreground mb-1 text-xs font-bold uppercase tracking-[0.18em]">
              Reintegration
            </p>
            <h2 className="font-heading text-card-foreground text-xl font-semibold">
              Reintegration Success Rates
            </h2>
          </div>

          <div className="grid gap-4 md:grid-cols-2">
            {/* By Type — progress bars */}
            <div className="rounded-2xl border border-border bg-card p-5 shadow-bloom">
              <h3 className="text-muted-foreground mb-4 text-xs font-bold uppercase tracking-wider">
                By Type
              </h3>
              {reintegration.byType.length === 0 ? (
                <p className="text-muted-foreground text-sm">No data available.</p>
              ) : (
                <div className="space-y-4">
                  {reintegration.byType.map((t) => {
                    const pct = t.total > 0 ? (t.successful / t.total) * 100 : 0
                    return (
                      <div key={t.reintegrationType}>
                        <div className="mb-1.5 flex items-center justify-between text-sm">
                          <span className="text-card-foreground font-medium">{t.reintegrationType}</span>
                          <span className="text-muted-foreground tabular-nums">
                            {pct.toFixed(1)}%
                            <span className="ml-1 text-xs">({t.successful}/{t.total})</span>
                          </span>
                        </div>
                        <div className="h-2 rounded-full bg-muted overflow-hidden">
                          <div
                            className="h-full rounded-full bg-primary motion-safe:transition-all motion-safe:duration-700"
                            style={{ width: `${pct}%` }}
                          />
                        </div>
                      </div>
                    )
                  })}
                </div>
              )}
            </div>

            {/* By Status */}
            <div className="rounded-2xl border border-border bg-card p-5 shadow-bloom">
              <h3 className="text-muted-foreground mb-4 text-xs font-bold uppercase tracking-wider">
                By Status
              </h3>
              {reintegration.byStatus.length === 0 ? (
                <p className="text-muted-foreground text-sm">No data available.</p>
              ) : (
                <div className="divide-y divide-border">
                  {reintegration.byStatus.map((s) => (
                    <div key={s.status} className="flex items-center justify-between py-2.5 text-sm">
                      <span className="text-card-foreground font-medium">{s.status}</span>
                      <span className="text-muted-foreground font-semibold tabular-nums">{s.count}</span>
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
