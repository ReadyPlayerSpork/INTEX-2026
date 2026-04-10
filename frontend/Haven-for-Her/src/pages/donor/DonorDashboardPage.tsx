import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { Heart } from 'lucide-react'
import { api } from '@/api/client'
import { buttonVariants } from '@/components/ui/button'
import { cn } from '@/lib/utils'
import { Card, CardContent } from '@/components/ui/card'
import { StatCard } from '@/components/shared/StatCard'
import { formatCurrencyAmount } from '@/features/public/donate/donationCurrencies'

interface GivingTotalRow {
  currencyCode: string
  total: number
}

interface DonorDashboard {
  totalDonations: number
  givingTotalsByCurrency: GivingTotalRow[]
  recurringDonations: number
  recentDonations: {
    donationId: number
    donationDate: string
    amount: number | null
    currencyCode: string
    campaignName: string | null
    isRecurring: boolean
  }[]
}

export function DonorDashboardPage() {
  const [data, setData] = useState<DonorDashboard | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    api
      .get<DonorDashboard>('/api/donor/dashboard')
      .then(setData)
      .catch((err) => console.error('Failed to load donor dashboard', err))
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
      <div className="mb-8 flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
        <div>
          <p className="text-muted-foreground text-sm font-semibold tracking-[0.18em] uppercase">
            Donor dashboard
          </p>
          <h1 className="font-heading mt-2 text-4xl font-semibold text-accent">
            Your giving history
          </h1>
        </div>
        <Link to="/donate" className={cn(buttonVariants(), 'no-underline')}>
          Make a donation
        </Link>
      </div>

      <div className="mb-8 grid grid-cols-1 items-stretch gap-6 sm:grid-cols-3">
        <StatCard label="Total donations" value={data.totalDonations} />
        <GivingTotalsCard rows={data.givingTotalsByCurrency} />
        <StatCard label="Recurring" value={data.recurringDonations} />
      </div>

      <h2 className="font-heading mb-4 text-lg font-semibold text-accent">Recent Donations</h2>
      {data.recentDonations.length === 0 ? (
        <div className="flex flex-col items-center gap-4 rounded-2xl bg-muted p-8 text-center">
          <Heart className="text-muted-foreground size-12" />
          <div>
            <p className="font-heading text-lg font-semibold text-accent">No donations yet</p>
            <p className="text-muted-foreground mt-1 text-sm">
              Your giving history will appear here once you make your first contribution.
            </p>
          </div>
          <Link to="/donate" className={cn(buttonVariants(), 'no-underline')}>
            Make your first gift
          </Link>
        </div>
      ) : (
        <Card className="overflow-hidden border-border/70 bg-card/95">
          <CardContent className="p-0">
            <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-border bg-secondary/50 border-b text-left">
                <th scope="col" className="px-3 py-2 font-medium">Date</th>
                <th scope="col" className="px-3 py-2 font-medium">Amount</th>
                <th scope="col" className="px-3 py-2 font-medium">Campaign</th>
                <th scope="col" className="px-3 py-2 font-medium">Recurring</th>
              </tr>
            </thead>
            <tbody>
              {data.recentDonations.map((d) => (
                <tr key={d.donationId} className="border-border/70 border-b last:border-b-0">
                  <td className="px-3 py-2">
                    {(() => {
                      try {
                        return new Date(d.donationDate).toLocaleDateString(undefined, {
                          month: 'short',
                          day: 'numeric',
                          year: 'numeric',
                        })
                      } catch {
                        return d.donationDate
                      }
                    })()}
                  </td>
                  <td className="px-3 py-2">
                    {d.amount != null
                      ? formatCurrencyAmount(d.currencyCode || 'USD', d.amount)
                      : '-'}
                  </td>
                  <td className="px-3 py-2">{d.campaignName ?? '-'}</td>
                  <td className="px-3 py-2">{d.isRecurring ? 'Yes' : 'No'}</td>
                </tr>
              ))}
            </tbody>
          </table>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )
}


function GivingTotalsCard({ rows }: { rows: GivingTotalRow[] }) {
  if (rows.length === 0) {
    return (
      <Card className="border-border/70 bg-card/95">
        <CardContent className="flex flex-col items-center justify-center gap-2 p-6 text-center">
          <p className="text-muted-foreground text-lg">No giving recorded yet</p>
          <p className="text-muted-foreground text-sm">Total giving</p>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card className="border-border/70 bg-card/95">
      <CardContent className="flex flex-col justify-center gap-3 p-6 text-center sm:text-left">
        <p className="text-muted-foreground text-sm font-medium">Total giving</p>
        <ul className="flex flex-col gap-2">
          {rows.map((row) => (
            <li
              key={row.currencyCode}
              className="flex flex-col gap-0.5 border-border/60 border-b pb-2 last:border-b-0 last:pb-0 sm:flex-row sm:items-baseline sm:justify-between sm:gap-4"
            >
              <span className="text-muted-foreground text-xs font-semibold tracking-wide uppercase">
                {row.currencyCode}
              </span>
              <span className="font-heading text-primary text-xl font-semibold sm:text-2xl">
                {formatCurrencyAmount(row.currencyCode, row.total)}
              </span>
            </li>
          ))}
        </ul>
      </CardContent>
    </Card>
  )
}
