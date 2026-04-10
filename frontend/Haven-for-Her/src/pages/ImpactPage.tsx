import {
  useImpactStats,
  useImpactTrends,
  type ImpactTrend,
} from '@/features/public/home/useImpactStats'
import { formatAnonymizedCount } from '@/features/public/home/anonymizedCounts'
import {
  Bar,
  CartesianGrid,
  ComposedChart,
  Legend,
  Line,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts'
import { Card, CardContent } from '@/components/ui/card'
import { formatCurrencyAmount } from '@/features/public/donate/donationCurrencies'
import womenGreenTop from "@/assets/Women's Green Top.jpg"

function parseMetricPayload(
  json: string | null | undefined,
): Record<string, unknown> | null {
  if (json == null || !String(json).trim()) return null
  const raw = String(json).trim()
  const tryParse = (s: string): Record<string, unknown> | null => {
    try {
      const o = JSON.parse(s) as unknown
      if (typeof o === 'object' && o !== null && !Array.isArray(o)) {
        return o as Record<string, unknown>
      }
      return null
    } catch {
      return null
    }
  }
  return tryParse(raw) ?? tryParse(raw.replace(/'/g, '"'))
}

function formatMetricValue(v: unknown): string {
  if (v === null || v === undefined) return '—'
  if (typeof v === 'number' || typeof v === 'boolean') return String(v)
  if (typeof v === 'string') return v
  try {
    return JSON.stringify(v)
  } catch {
    return String(v)
  }
}

const METRIC_LABELS: Record<string, string> = {
  avg_health_score: 'Average health score',
  avg_education_progress: 'Average education progress (%)',
  based_on_health_records: 'Residents in health sample',
  based_on_education_records: 'Residents in education sample',
  month: 'Report month',
  total_residents: 'Residents (snapshot)',
  donations_total_for_month: 'Donations that month (snapshot)',
  source: 'Data source',
}

export function ImpactPage() {
  const { stats, isLoading: loadingStats } = useImpactStats()
  const { trends, isLoading: loadingTrends } = useImpactTrends()

  if (loadingStats) {
    return (
      <div className="mx-auto max-w-7xl px-5 py-16 md:px-10 md:py-24">
        <p className="text-muted-foreground animate-pulse">Loading impact data...</p>
      </div>
    )
  }

  if (!stats) {
    return (
      <div className="mx-auto max-w-7xl px-5 py-16 md:px-10 md:py-24">
        <p className="text-muted-foreground">Unable to load impact data.</p>
      </div>
    )
  }

  const live = stats.liveProgramOutcomes
  const impact = stats.donationImpact
  const metrics = stats.latestSnapshot?.metricPayloadJson
    ? parseMetricPayload(stats.latestSnapshot.metricPayloadJson)
    : null

  const summaryText =
    stats.latestSnapshot?.displaySummaryText?.trim() ||
    stats.latestSnapshot?.summaryText ||
    ''

  return (
    <div className="px-5 py-16 md:px-10 md:py-24">
      <div className="mx-auto max-w-7xl">
        <div className="mb-12 grid gap-10 lg:grid-cols-2 lg:items-center">
          <div className="max-w-3xl">
            <p className="text-muted-foreground text-sm font-semibold tracking-[0.18em] uppercase">
              Our mission
            </p>
            <h1 className="font-heading mt-3 text-balance text-[clamp(2.5rem,5vw,4rem)] font-semibold text-accent">
              Protecting and restoring lives
            </h1>
            <p className="text-muted-foreground mt-4 text-pretty text-lg leading-8">
              Here is a realistic look at our operations and outcomes. We track our effectiveness so
              partners and donors know exactly where resources go and how lives are changing—using the
              same resident-level signals that power our outcome models.
            </p>
          </div>
          <img
            src={womenGreenTop}
            alt="Women in an embrace"
            className="hidden lg:block rounded-3xl object-cover aspect-[4/3] w-full shadow-xl border border-border/50 brightness-105 contrast-105"
          />
        </div>

        <div className="mb-12 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          <Stat label="Survivors served (all time)" value={stats.totalResidentsServed} />
          <Stat
            label="Residents in active care (rounded)"
            value={formatAnonymizedCount(stats.activeResidents)}
            hint="Shown like our home page to protect privacy."
          />
          <Stat label="Active safe homes" value={stats.activeSafehouses} />
          <Stat label="Partner organizations" value={stats.activePartners} />
          <Stat
            label="Average wellbeing score (active care)"
            value={
              live?.avgGeneralHealthScore != null
                ? live.avgGeneralHealthScore.toFixed(2)
                : '—'
            }
            hint={
              live && live.residentsInHealthSample > 0
                ? 'From the most recent wellbeing record per resident in active care.'
                : undefined
            }
          />
          <Stat
            label="Average education progress (active care)"
            value={
              live?.avgEducationProgressPercent != null
                ? `${live.avgEducationProgressPercent.toFixed(1)}%`
                : '—'
            }
            hint={
              live && live.residentsInEducationSample > 0
                ? 'From the most recent education record per resident in active care.'
                : undefined
            }
          />
          <Stat
            label="Illustrative weekly support per resident (USD)"
            value={
              impact?.estimatedWeeklySupportPerResidentUsd != null
                ? formatCurrencyAmount(
                    'USD',
                    impact.estimatedWeeklySupportPerResidentUsd,
                  )
                : '—'
            }
            hint={
              impact?.basedOnTrailingTwelveMonths
                ? 'Based on monetary USD gifts in the last 12 months, spread across active residents (illustrative).'
                : 'Based on all-time monetary USD in our system, divided by 52 weeks and active residents when recent data is thin (illustrative).'
            }
          />
          <Stat
            label="Total monetary giving (USD, all time)"
            value={formatCurrencyAmount('USD', stats.totalDonationValueUsd)}
          />
        </div>

        {impact &&
          impact.sampleGiftWeekCoveragePercent != null &&
          impact.estimatedWeeklySupportPerResidentUsd != null &&
          impact.estimatedWeeklySupportPerResidentUsd > 0 && (
            <Card className="border-border/70 bg-card/95 mb-10">
              <CardContent className="p-8">
                <h2 className="font-heading text-xl font-semibold text-accent">
                  What your gift can do
                </h2>
                <p className="text-muted-foreground mt-3 leading-7 text-pretty">
                  When neighbors give together, pooled monetary support works out to roughly{' '}
                  <strong className="text-foreground">
                    {formatCurrencyAmount(
                      'USD',
                      impact.estimatedWeeklySupportPerResidentUsd,
                    )}
                  </strong>{' '}
                  per week toward programming for each girl in active care (not a line-item budget—an
                  illustration to show scale).
                </p>
                <p className="text-muted-foreground mt-4 leading-7 text-pretty">
                  A{' '}
                  <strong className="text-foreground">
                    {formatCurrencyAmount('USD', impact.sampleGiftUsd)}
                  </strong>{' '}
                  gift covers about{' '}
                  <strong className="text-foreground">
                    {impact.sampleGiftWeekCoveragePercent}%
                  </strong>{' '}
                  of that illustrative week for one resident—similar to pitching in for essentials like
                  meals and supplies for a week of residential care.
                </p>
              </CardContent>
            </Card>
          )}

        {loadingTrends ? (
          <Card className="border-border/70 bg-card/95 mb-10">
            <CardContent className="p-8">
              <h2 className="font-heading text-2xl font-semibold text-accent mb-6">
                Donations vs. Resident Outcomes
              </h2>
              <p className="text-muted-foreground animate-pulse text-sm">Loading trend data…</p>
            </CardContent>
          </Card>
        ) : null}

        {!loadingTrends && trends.length === 0 ? (
          <Card className="border-border/70 bg-card/95 mb-10">
            <CardContent className="p-8">
              <h2 className="font-heading text-2xl font-semibold text-accent mb-6">
                Donations vs. Resident Outcomes
              </h2>
              <p className="text-muted-foreground text-sm leading-relaxed">
                Outcome trends could not be loaded. This usually means the browser could not reach the
                API—for example, if the production build is missing{' '}
                <span className="font-mono text-xs">VITE_API_BASE_URL</span> pointing at your backend,
                or the API is not yet deployed with{' '}
                <span className="font-mono text-xs">GET /api/public/impact-trends</span>. Wait for the
                deploy to finish, confirm env vars, then hard-refresh.
              </p>
            </CardContent>
          </Card>
        ) : null}

        {!loadingTrends && trends.length > 0 ? (
          <Card className="border-border/70 bg-card/95 mb-10">
            <CardContent className="p-8">
              <h2 className="font-heading text-2xl font-semibold text-accent mb-6">
                Donations vs. Resident Outcomes
              </h2>
              <div className="h-[400px] w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <ComposedChart
                    data={trends}
                    margin={{ top: 20, right: 20, bottom: 20, left: 20 }}
                  >
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="hsl(var(--border))" />
                    <XAxis
                      dataKey="month"
                      tick={{ fill: 'hsl(var(--muted-foreground))', fontSize: 12 }}
                      axisLine={false}
                      tickLine={false}
                    />
                    <YAxis
                      yAxisId="left"
                      orientation="left"
                      tick={{ fill: 'hsl(var(--muted-foreground))', fontSize: 12 }}
                      axisLine={false}
                      tickLine={false}
                      tickFormatter={(v) => `$${(v / 1000).toFixed(0)}k`}
                    />
                    <YAxis
                      yAxisId="right"
                      orientation="right"
                      domain={[0, 100]}
                      tick={{ fill: 'hsl(var(--muted-foreground))', fontSize: 12 }}
                      axisLine={false}
                      tickLine={false}
                      tickFormatter={(v) => `${v}%`}
                    />
                    <Tooltip
                      contentStyle={{
                        backgroundColor: 'hsl(var(--card))',
                        borderColor: 'hsl(var(--border))',
                        borderRadius: '8px',
                      }}
                      itemStyle={{ color: 'hsl(var(--foreground))' }}
                      formatter={(value, name) => {
                        const raw = Array.isArray(value) ? value[0] : value
                        const val = Number(raw ?? 0)
                        const nameStr = String(name ?? '')
                        if (nameStr === 'Total Donations') return [`$${val.toLocaleString()}`, nameStr]
                        if (nameStr === 'Avg Education Progress') return [`${val.toFixed(1)}%`, nameStr]
                        if (nameStr === 'Avg Health Score (x20)')
                          return [`${(val / 20).toFixed(1)} / 5`, 'Avg Health Score']
                        return [String(val), nameStr]
                      }}
                    />
                    <Legend wrapperStyle={{ paddingTop: '20px' }} />
                    <Bar
                      yAxisId="left"
                      dataKey="totalDonations"
                      name="Total Donations"
                      fill="hsl(var(--primary))"
                      radius={[4, 4, 0, 0]}
                      barSize={40}
                    />
                    <Line
                      yAxisId="right"
                      type="monotone"
                      dataKey="avgEducationProgress"
                      name="Avg Education Progress"
                      stroke="hsl(var(--accent))"
                      strokeWidth={3}
                      dot={{ r: 4, fill: 'hsl(var(--accent))' }}
                      activeDot={{ r: 6 }}
                    />
                    <Line
                      yAxisId="right"
                      type="monotone"
                      dataKey={(d: ImpactTrend) => d.avgHealthScore * 20}
                      name="Avg Health Score (x20)"
                      stroke="hsl(var(--destructive))"
                      strokeWidth={3}
                      dot={{ r: 4, fill: 'hsl(var(--destructive))' }}
                      activeDot={{ r: 6 }}
                    />
                  </ComposedChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>
        ) : null}

        {stats.latestSnapshot && (
          <Card className="border-primary/18 bg-primary/7 mb-10">
            <CardContent className="p-8">
              <h2 className="font-heading text-2xl font-semibold text-accent">
                {stats.latestSnapshot.headline}
              </h2>
              {summaryText ? (
                <p className="text-muted-foreground mt-3 leading-7 text-pretty">
                  {summaryText}
                </p>
              ) : null}
              <p className="text-muted-foreground mt-3 text-xs">
                Published{' '}
                {new Date(stats.latestSnapshot.publishedAt).toLocaleDateString()}
              </p>

              {metrics && Object.keys(metrics).length > 0 && (
                <div className="border-border/60 mt-6 border-t pt-6">
                  <h3 className="text-foreground mb-3 text-sm font-semibold tracking-wide uppercase">
                    Program metrics (aggregate)
                  </h3>
                  <ul className="grid gap-2 sm:grid-cols-2">
                    {Object.entries(metrics).map(([key, val]) => (
                      <li
                        key={key}
                        className="text-muted-foreground flex justify-between gap-4 text-sm"
                      >
                        <span className="text-foreground font-medium">
                          {METRIC_LABELS[key] ??
                            key.replace(/([A-Z])/g, ' $1').replace(/_/g, ' ').trim()}
                        </span>
                        <span className="text-right tabular-nums">{formatMetricValue(val)}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </CardContent>
          </Card>
        )}

        <p className="text-muted-foreground mt-12 text-center text-sm">
          All data is anonymized and aggregated. No personally identifiable
          information is displayed.
        </p>
      </div>
    </div>
  )
}

function Stat({
  label,
  value,
  hint,
}: {
  label: string
  value: string | number
  hint?: string
}) {
  return (
    <Card className="h-full border-border/70 bg-card/95">
      <CardContent className="p-6 text-center">
        <p className="font-heading text-primary text-3xl font-semibold">{value}</p>
        <p className="text-muted-foreground mt-2 text-sm">{label}</p>
        {hint ? (
          <p className="text-muted-foreground/90 mt-2 text-xs leading-snug">{hint}</p>
        ) : null}
      </CardContent>
    </Card>
  )
}
