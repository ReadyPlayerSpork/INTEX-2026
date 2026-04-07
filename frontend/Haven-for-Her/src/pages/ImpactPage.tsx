import { useEffect, useState } from 'react'
import { api } from '@/api/client'

interface ImpactStats {
  totalResidentsServed: number
  activeResidents: number
  totalDonations: number
  totalDonationValuePhp: number
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
      .catch(() => {})
      .finally(() => setLoading(false))
  }, [])

  if (loading) {
    return (
      <div className="mx-auto max-w-7xl px-4 py-12">
        <p className="text-muted-foreground animate-pulse">Loading impact data...</p>
      </div>
    )
  }

  if (!stats) {
    return (
      <div className="mx-auto max-w-7xl px-4 py-12">
        <p className="text-muted-foreground">Unable to load impact data.</p>
      </div>
    )
  }

  return (
    <div className="mx-auto max-w-7xl px-4 py-12">
      <h1 className="mb-8 text-3xl font-bold">Our Impact</h1>

      <div className="mb-12 grid grid-cols-2 gap-6 sm:grid-cols-3">
        <Stat label="Total residents served" value={stats.totalResidentsServed} />
        <Stat label="Currently active" value={stats.activeResidents} />
        <Stat label="Total donations" value={stats.totalDonations} />
        <Stat
          label="Total donated (PHP)"
          value={`₱${stats.totalDonationValuePhp.toLocaleString()}`}
        />
        <Stat label="Active safe homes" value={stats.activeSafehouses} />
        <Stat label="Partner organizations" value={stats.activePartners} />
      </div>

      {stats.latestSnapshot && (
        <section className="bg-muted/50 rounded-lg p-8">
          <h2 className="mb-2 text-xl font-semibold">
            {stats.latestSnapshot.headline}
          </h2>
          <p className="text-muted-foreground mb-2">
            {stats.latestSnapshot.summaryText}
          </p>
          <p className="text-muted-foreground text-xs">
            Published{' '}
            {new Date(stats.latestSnapshot.publishedAt).toLocaleDateString()}
          </p>
        </section>
      )}

      <p className="text-muted-foreground mt-12 text-center text-sm">
        All data is anonymized and aggregated. No personally identifiable
        information is displayed.
      </p>
    </div>
  )
}

function Stat({ label, value }: { label: string; value: string | number }) {
  return (
    <div className="bg-card border-border rounded-lg border p-6 text-center">
      <p className="text-primary text-3xl font-bold">{value}</p>
      <p className="text-muted-foreground mt-1 text-sm">{label}</p>
    </div>
  )
}
