import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { api } from '@/api/client'
import { Card, CardContent } from '@/components/ui/card'

interface FinancialDashboard {
  totalMonetaryPhp: number
  totalInKindValuePhp: number
  recurringDonations: number
  oneTimeDonations: number
  totalDonors: number
  topCampaigns: { campaign: string; total: number; count: number }[]
  donationsByType: { type: string; count: number; total: number }[]
}

export function FinancialDashboardPage() {
  const [data, setData] = useState<FinancialDashboard | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    api
      .get<FinancialDashboard>('/api/financial/dashboard')
      .then(setData)
      .catch((err) => console.error('Failed to load financial dashboard', err))
      .finally(() => setLoading(false))
  }, [])

  if (loading) {
    return (
      <div className="mx-auto max-w-7xl px-4 py-12">
        <p className="text-muted-foreground animate-pulse">Loading...</p>
      </div>
    )
  }

  if (!data) {
    return (
      <div className="mx-auto max-w-7xl px-4 py-12">
        <p className="text-muted-foreground">Unable to load dashboard.</p>
      </div>
    )
  }

  return (
    <div className="mx-auto max-w-7xl px-5 py-16 md:px-10 md:py-20">
      <div className="mb-8">
        <p className="text-muted-foreground text-sm font-semibold tracking-[0.18em] uppercase">
          Financial dashboard
        </p>
        <h1 className="font-heading mt-2 text-4xl font-semibold text-accent">
          Financial Dashboard
        </h1>
      </div>

      {/* Quick nav */}
      <div className="text-muted-foreground mb-6 flex flex-wrap gap-4 text-sm">
        <Link to="/financial/donors" className="hover:text-foreground underline">
          Donor Management
        </Link>
        <Link to="/financial/donations" className="hover:text-foreground underline">
          Donation Records
        </Link>
        <Link to="/financial/insights" className="hover:text-foreground underline">
          Retention Insights
        </Link>
        <Link to="/financial/reports" className="hover:text-foreground underline">
          Export Reports
        </Link>
      </div>

      {/* Summary cards */}
      <div className="mb-8 grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-5">
        <Stat label="Monetary (PHP)" value={`₱${data.totalMonetaryPhp.toLocaleString()}`} />
        <Stat label="In-Kind Value" value={`₱${data.totalInKindValuePhp.toLocaleString()}`} />
        <Stat label="Recurring" value={data.recurringDonations} />
        <Stat label="One-Time" value={data.oneTimeDonations} />
        <Stat label="Total Donors" value={data.totalDonors} />
      </div>

      <div className="grid gap-8 lg:grid-cols-2">
        {/* By type */}
        <section>
          <h2 className="mb-3 text-lg font-semibold">Donations by Type</h2>
          <div className="space-y-2">
            {data.donationsByType.map((t) => (
              <div
                key={t.type}
                className="bg-card border-border/70 flex items-center justify-between rounded-2xl border p-4"
              >
                <span className="text-sm font-medium">{t.type}</span>
                <span className="text-muted-foreground text-sm">
                  {t.count} donations · ₱{t.total.toLocaleString()}
                </span>
              </div>
            ))}
          </div>
        </section>

        {/* Top campaigns */}
        <section>
          <h2 className="mb-3 text-lg font-semibold">Top Campaigns</h2>
          {data.topCampaigns.length === 0 ? (
            <p className="text-muted-foreground text-sm">No campaigns found.</p>
          ) : (
            <div className="space-y-2">
              {data.topCampaigns.map((c) => (
                <div
                  key={c.campaign}
                className="bg-card border-border/70 flex items-center justify-between rounded-2xl border p-4"
                >
                  <span className="text-sm font-medium">{c.campaign}</span>
                  <span className="text-muted-foreground text-sm">
                    {c.count} donations · ₱{c.total.toLocaleString()}
                  </span>
                </div>
              ))}
            </div>
          )}
        </section>
      </div>
    </div>
  )
}

function Stat({ label, value }: { label: string; value: string | number }) {
  return (
    <Card className="border-border/70 bg-card/95">
      <CardContent className="p-5 text-center">
        <p className="text-primary text-2xl font-extrabold">{value}</p>
        <p className="text-muted-foreground mt-2 text-xs">{label}</p>
      </CardContent>
    </Card>
  )
}
