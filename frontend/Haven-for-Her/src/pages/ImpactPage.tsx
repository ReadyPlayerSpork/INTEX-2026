import { useEffect, useState } from 'react'
import { api } from '@/api/client'
import { Card, CardContent } from '@/components/ui/card'

interface ImpactStats {
  totalResidentsServed: number
  activeSafehouses: number
  activePartners: number
  latestSnapshot: {
    headline: string
    summaryText: string
    publishedAt: string
  } | null
}

export function ImpactPage() {
  const [stats, setStats] = useState<ImpactStats | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    api
      .get<ImpactStats>('/api/public/impact')
      .then(setStats)
      .catch((err) => console.error('Failed to load impact data', err))
      .finally(() => setLoading(false))
  }, [])

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

  return (
    <div className="px-5 py-16 md:px-10 md:py-24">
      <div className="mx-auto max-w-7xl">
        <div className="mb-12 max-w-3xl">
          <p className="text-muted-foreground text-sm font-semibold tracking-[0.18em] uppercase">
            Our mission
          </p>
          <h1 className="font-heading mt-3 text-balance text-[clamp(2.5rem,5vw,4rem)] font-semibold text-accent">
            Protecting and restoring lives
          </h1>
          <p className="text-muted-foreground mt-4 text-pretty text-lg leading-8">
            Haven for Her exists to provide safety, healing, and hope to
            survivors of sexual assault. Through safe housing,
            trauma-informed counseling, and community partnerships, we walk
            alongside survivors on their path to restoration.
          </p>
        </div>

        <div className="mb-12 grid gap-5 sm:grid-cols-3">
          <Stat label="Survivors served" value={stats.totalResidentsServed} />
          <Stat label="Active safe homes" value={stats.activeSafehouses} />
          <Stat label="Partner organizations" value={stats.activePartners} />
        </div>

        {stats.latestSnapshot && (
          <Card className="border-primary/18 bg-primary/7">
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
