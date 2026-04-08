import { useCallback, useEffect, useState } from 'react'
import { Button } from '@/components/ui/button'
import { reportsApi, type DonationTrend } from '@/api/reportsApi'
import { TrendChart } from '@/components/shared/TrendChart'
import { financialApi, type AllocationsResponse } from '@/api/financialApi'
import { AllocationBreakdown } from '@/components/financial/AllocationBreakdown'

const MONTH_NAMES = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec']

export function ReportsPage() {
  const [from, setFrom] = useState('')
  const [to, setTo] = useState('')
  const [trends, setTrends] = useState<DonationTrend[]>([])
  const [allocations, setAllocations] = useState<AllocationsResponse | null>(null)
  const [loadingTrends, setLoadingTrends] = useState(true)

  const fetchTrends = useCallback(async () => {
    setLoadingTrends(true)
    try {
      const [t, a] = await Promise.all([
        reportsApi.getDonationTrends(12),
        financialApi.getAllocations(),
      ])
      setTrends(t)
      setAllocations(a)
    } catch {
      // ignore
    } finally {
      setLoadingTrends(false)
    }
  }, [])

  useEffect(() => { void fetchTrends() }, [fetchTrends])

  const downloadCsv = () => {
    const qs = new URLSearchParams()
    if (from) qs.set('from', from)
    if (to) qs.set('to', to)
    window.open(`/api/financial/export/csv?${qs}`, '_blank')
  }

  const chartData = trends.map((t) => ({
    label: `${MONTH_NAMES[t.month - 1]} ${t.year}`,
    value: t.monetaryTotal,
    secondaryValue: t.inKindTotal,
  }))

  return (
    <div className="mx-auto max-w-5xl px-4 py-12">
      <h1 className="mb-6 font-heading text-2xl font-bold text-plum">Financial Reports</h1>

      {/* Donation Trends */}
      {loadingTrends ? (
        <p className="text-muted-foreground mb-6 animate-pulse">Loading trends...</p>
      ) : (
        <div className="mb-8">
          <TrendChart
            data={chartData}
            title="Donation Trends (Last 12 Months)"
            valueLabel="Monetary"
            secondaryLabel="In-Kind"
            height={220}
          />
        </div>
      )}

      {/* Allocation Breakdown */}
      {allocations && (
        <div className="mb-8">
          <h2 className="mb-4 font-heading text-xl font-semibold text-plum">Donation Allocations</h2>
          <AllocationBreakdown bySafehouse={allocations.bySafehouse} byProgramArea={allocations.byProgramArea} />
        </div>
      )}

      {/* CSV Export */}
      <div className="rounded-2xl bg-cream p-6">
        <h2 className="mb-4 font-heading text-lg font-semibold text-plum">Donation Export (CSV)</h2>
        <p className="mb-4 text-sm text-soft-purple/70">
          Download all donations for a date range as a CSV file.
        </p>

        <div className="mb-4 grid gap-4 sm:grid-cols-2">
          <label className="flex flex-col gap-1">
            <span className="text-sm font-medium text-soft-purple">From date</span>
            <input
              type="date"
              value={from}
              onChange={(e) => setFrom(e.target.value)}
              className="border-input bg-background rounded-md border px-3 py-2 text-sm"
            />
          </label>
          <label className="flex flex-col gap-1">
            <span className="text-sm font-medium text-soft-purple">To date</span>
            <input
              type="date"
              value={to}
              onChange={(e) => setTo(e.target.value)}
              className="border-input bg-background rounded-md border px-3 py-2 text-sm"
            />
          </label>
        </div>

        <Button onClick={downloadCsv}>Download CSV</Button>
      </div>
    </div>
  )
}
