import { useEffect, useState } from 'react'
import { api } from '@/api/client'
import { StatCard } from '@/components/shared/StatCard'
import { formatCurrencyAmount } from '@/features/public/donate/donationCurrencies'

interface FinancialDashboard {
  totalMonetaryUsd: number
  totalInKindValueUsd: number
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
          Financial portal
        </p>
        <h1 className="font-heading mt-2 text-4xl font-semibold text-accent">
          Giving Overview
        </h1>
      </div>


      {/* Summary cards */}
      <div className="mb-8 grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-5">
        <StatCard
          label="Monetary (USD)"
          value={formatCurrencyAmount('USD', data.totalMonetaryUsd)}
        />
        <StatCard
          label="In-Kind (est. USD)"
          value={formatCurrencyAmount('USD', data.totalInKindValueUsd)}
        />
        <StatCard label="Recurring" value={data.recurringDonations} />
        <StatCard label="One-Time" value={data.oneTimeDonations} />
        <StatCard label="Total Donors" value={data.totalDonors} />
      </div>

      <div className="grid gap-8 lg:grid-cols-2">
        {/* By type */}
        <section>
          <h2 className="font-heading mb-3 text-lg font-semibold text-accent">Donations by Type</h2>
          <div className="space-y-2">
            {data.donationsByType.map((t) => (
              <div
                key={t.type}
                className="bg-card border-border/70 flex items-center justify-between rounded-2xl border p-4"
              >
                <span className="text-sm font-medium">{t.type}</span>
                <span className="text-muted-foreground text-sm">
                  {t.count} donations ·{' '}
                  {formatCurrencyAmount('USD', t.total)}
                </span>
              </div>
            ))}
          </div>
        </section>

        {/* Top campaigns */}
        <section>
          <h2 className="font-heading mb-3 text-lg font-semibold text-accent">Top Campaigns</h2>
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
                    {c.count} donations ·{' '}
                    {formatCurrencyAmount('USD', c.total)}
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

