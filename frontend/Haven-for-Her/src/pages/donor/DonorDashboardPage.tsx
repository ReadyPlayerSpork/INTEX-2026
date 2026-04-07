import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { api } from '@/api/client'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
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

  const givingRowCount = data.givingTotalsByCurrency.length
  /** Side stat cards scale up when the middle “giving” card is taller (multiple currencies). */
  const statVisualScale: 'compact' | 'comfortable' | 'roomy' =
    givingRowCount <= 1 ? 'compact' : givingRowCount === 2 ? 'comfortable' : 'roomy'

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
        <Link to="/donate">
          <Button>Make a donation</Button>
        </Link>
      </div>

      <div className="mb-8 grid grid-cols-1 items-stretch gap-6 sm:grid-cols-3">
        <Stat
          label="Total donations"
          value={data.totalDonations}
          visualScale={statVisualScale}
        />
        <GivingTotalsCard rows={data.givingTotalsByCurrency} />
        <Stat
          label="Recurring"
          value={data.recurringDonations}
          visualScale={statVisualScale}
        />
      </div>

      <h2 className="mb-4 text-lg font-semibold">Recent Donations</h2>
      {data.recentDonations.length === 0 ? (
        <p className="text-muted-foreground text-sm">No donations yet.</p>
      ) : (
        <Card className="overflow-hidden border-border/70 bg-card/95">
          <CardContent className="p-0">
            <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-border bg-secondary/50 border-b text-left">
                <th className="px-3 py-2 font-medium">Date</th>
                <th className="px-3 py-2 font-medium">Amount</th>
                <th className="px-3 py-2 font-medium">Campaign</th>
                <th className="px-3 py-2 font-medium">Recurring</th>
              </tr>
            </thead>
            <tbody>
              {data.recentDonations.map((d) => (
                <tr key={d.donationId} className="border-border/70 border-b last:border-b-0">
                  <td className="px-3 py-2">{d.donationDate}</td>
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

const statValueScale: Record<
  'compact' | 'comfortable' | 'roomy',
  string
> = {
  compact: 'text-3xl sm:text-4xl',
  comfortable: 'text-4xl sm:text-5xl',
  roomy: 'text-4xl sm:text-5xl md:text-6xl',
}

const statLabelScale: Record<
  'compact' | 'comfortable' | 'roomy',
  string
> = {
  compact: 'text-sm',
  comfortable: 'text-sm sm:text-base',
  roomy: 'text-base sm:text-lg',
}

function Stat({
  label,
  value,
  visualScale,
}: {
  label: string
  value: string | number
  visualScale: 'compact' | 'comfortable' | 'roomy'
}) {
  return (
    <Card className="flex h-full min-h-0 flex-col border-border/70 bg-card/95">
      <CardContent className="flex flex-1 flex-col items-center justify-center gap-2 px-5 py-8 text-center sm:gap-3 sm:px-6 sm:py-10">
        <p
          className={`text-primary font-extrabold leading-none tracking-tight motion-safe:transition-[font-size] motion-safe:duration-200 ${statValueScale[visualScale]}`}
        >
          {value}
        </p>
        <p
          className={`text-muted-foreground max-w-[14ch] leading-snug motion-safe:transition-[font-size] motion-safe:duration-200 ${statLabelScale[visualScale]}`}
        >
          {label}
        </p>
      </CardContent>
    </Card>
  )
}

function GivingTotalsCard({ rows }: { rows: GivingTotalRow[] }) {
  const multi = rows.length > 1
  const roomy = rows.length > 2

  return (
    <Card className="flex h-full min-h-0 flex-col border-border/70 bg-card/95">
      <CardContent className="flex flex-1 flex-col justify-center gap-3 p-6 text-center motion-safe:transition-[padding,gap] motion-safe:duration-200 sm:gap-4 sm:p-8 sm:text-left md:gap-5 md:p-10">
        {rows.length === 0 ? (
          <>
            <p
              className={`text-muted-foreground motion-safe:transition-[font-size] motion-safe:duration-200 ${roomy ? 'text-xl md:text-2xl' : 'text-lg'}`}
            >
              No giving recorded yet
            </p>
            <p
              className={`text-muted-foreground mt-2 motion-safe:transition-[font-size] motion-safe:duration-200 ${roomy ? 'text-base md:text-lg' : 'text-sm'}`}
            >
              Total giving
            </p>
          </>
        ) : rows.length === 1 ? (
          <>
            <p className="text-primary text-3xl font-extrabold motion-safe:transition-[font-size] motion-safe:duration-200 sm:text-4xl md:text-5xl">
              {formatCurrencyAmount(rows[0].currencyCode, rows[0].total)}
            </p>
            <p className="text-muted-foreground mt-2 text-sm motion-safe:transition-[font-size] motion-safe:duration-200 sm:text-base">
              Total giving ({rows[0].currencyCode})
            </p>
          </>
        ) : (
          <>
            <p
              className={`text-muted-foreground font-medium motion-safe:transition-[font-size] motion-safe:duration-200 ${roomy ? 'text-base md:text-lg' : 'text-sm sm:text-base'}`}
            >
              Total giving
            </p>
            <ul
              className={`flex flex-col motion-safe:transition-[gap] motion-safe:duration-200 ${roomy ? 'gap-3 md:gap-4' : 'gap-2'}`}
            >
              {rows.map((row) => (
                <li
                  key={row.currencyCode}
                  className="flex flex-col gap-0.5 border-border/60 border-b pb-2 last:border-b-0 last:pb-0 sm:flex-row sm:items-baseline sm:justify-between sm:gap-4"
                >
                  <span
                    className={`text-muted-foreground font-semibold tracking-wide uppercase motion-safe:transition-[font-size] motion-safe:duration-200 ${roomy ? 'text-xs md:text-sm' : 'text-xs'}`}
                  >
                    {row.currencyCode}
                  </span>
                  <span
                    className={`text-primary font-extrabold motion-safe:transition-[font-size] motion-safe:duration-200 ${roomy ? 'text-2xl sm:text-3xl md:text-4xl' : multi ? 'text-xl sm:text-2xl md:text-3xl' : ''}`}
                  >
                    {formatCurrencyAmount(row.currencyCode, row.total)}
                  </span>
                </li>
              ))}
            </ul>
          </>
        )}
      </CardContent>
    </Card>
  )
}
