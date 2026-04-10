import { useImpactStats } from '@/features/public/home/useImpactStats'
import { Card, CardContent } from '@/components/ui/card'
import { formatCurrencyAmount } from '@/features/public/donate/donationCurrencies'
import womenGreenTop from "@/assets/Women's Green Top.jpg"

function parseMetricPayload(
  json: string | null | undefined,
): Record<string, unknown> | null {
  if (json == null || !String(json).trim()) return null
  try {
    const o = JSON.parse(String(json)) as unknown
    if (typeof o === 'object' && o !== null && !Array.isArray(o)) {
      return o as Record<string, unknown>
    }
    return null
  } catch {
    return null
  }
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

export function ImpactPage() {
  const { stats, isLoading: loading } = useImpactStats()

  if (loading) {
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

  const metrics = stats.latestSnapshot?.metricPayloadJson
    ? parseMetricPayload(stats.latestSnapshot.metricPayloadJson)
    : null

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
              Here is a realistic look at our operations and outcomes. We track our effectiveness so partners and donors know exactly where resources go and how lives are changing.
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
          <Stat label="Residents in active care" value={stats.activeResidents} />
          <Stat label="Active safe homes" value={stats.activeSafehouses} />
          <Stat label="Partner organizations" value={stats.activePartners} />
          <Stat label="Donation records (count)" value={stats.totalDonations} />
          <Stat
            label="Total monetary giving (USD)"
            value={formatCurrencyAmount('USD', stats.totalDonationValueUsd)}
          />
        </div>

        {stats.latestSnapshot && (
          <Card className="border-primary/18 bg-primary/7 mb-10">
            <CardContent className="p-8">
              <h2 className="font-heading text-2xl font-semibold text-accent">
                {stats.latestSnapshot.headline}
              </h2>
              <p className="text-muted-foreground mt-3 leading-7 text-pretty">
                {stats.latestSnapshot.summaryText}
              </p>
              <p className="text-muted-foreground mt-3 text-xs">
                Published{' '}
                {new Date(stats.latestSnapshot.publishedAt).toLocaleDateString()}
              </p>

              {metrics && Object.keys(metrics).length > 0 && (
                <div className="border-border/60 mt-6 border-t pt-6">
                  <h3 className="text-foreground mb-3 text-sm font-semibold tracking-wide uppercase">
                    Snapshot metrics
                  </h3>
                  <ul className="grid gap-2 sm:grid-cols-2">
                    {Object.entries(metrics).map(([key, val]) => (
                      <li
                        key={key}
                        className="text-muted-foreground flex justify-between gap-4 text-sm"
                      >
                        <span className="text-foreground font-medium capitalize">
                          {key.replace(/([A-Z])/g, ' $1').replace(/_/g, ' ').trim()}
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

function Stat({ label, value }: { label: string; value: string | number }) {
  return (
    <Card className="h-full border-border/70 bg-card/95">
      <CardContent className="p-6 text-center">
        <p className="font-heading text-primary text-3xl font-semibold">{value}</p>
        <p className="text-muted-foreground mt-2 text-sm">{label}</p>
      </CardContent>
    </Card>
  )
}
