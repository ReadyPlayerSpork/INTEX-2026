import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { api } from '@/api/client'

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
      .catch(() => {})
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
    <div className="mx-auto max-w-7xl px-4 py-12">
      <h1 className="mb-8 text-2xl font-bold">Financial Dashboard</h1>

      {/* Quick nav */}
      <div className="text-muted-foreground mb-6 flex gap-4 text-sm">
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
                className="bg-card border-border flex items-center justify-between rounded border p-3"
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
                  className="bg-card border-border flex items-center justify-between rounded border p-3"
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
    <div className="bg-card border-border rounded-lg border p-4 text-center">
      <p className="text-primary text-2xl font-bold">{value}</p>
      <p className="text-muted-foreground mt-1 text-xs">{label}</p>
    </div>
  )
}
