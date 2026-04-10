import { useCallback, useEffect, useState } from 'react'
import { Button } from '@/components/ui/button'
import { reportsApi, type DonationTrend } from '@/api/reportsApi'
import { TrendChart } from '@/components/shared/TrendChart'
import { financialApi, type AllocationsResponse } from '@/api/financialApi'
import { AllocationBreakdown } from '@/components/financial/AllocationBreakdown'
import { downloadFromApi } from '@/api/client'

const MONTH_NAMES = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec']

export function ReportsPage() {
  const [from, setFrom] = useState('')
  const [to, setTo] = useState('')
  const [trends, setTrends] = useState<DonationTrend[]>([])
  const [allocations, setAllocations] = useState<AllocationsResponse | null>(null)
  const [loadingTrends, setLoadingTrends] = useState(true)
  const [trendsError, setTrendsError] = useState<string | null>(null)
  const [csvError, setCsvError] = useState<string | null>(null)

  const fetchTrends = useCallback(async () => {
    setLoadingTrends(true)
    setTrendsError(null)
    try {
      const [t, a] = await Promise.all([
        reportsApi.getDonationTrends(12),
        financialApi.getAllocations(),
      ])
      setTrends(t)
      setAllocations(a)
    } catch {
      setTrends([])
      setAllocations(null)
      setTrendsError('Could not load donation trends. Check that you are signed in as Financial or Admin and that the API is reachable.')
    } finally {
      setLoadingTrends(false)
    }
  }, [])

  useEffect(() => { void fetchTrends() }, [fetchTrends])

  const downloadCsv = async () => {
    setCsvError(null)
    const qs = new URLSearchParams()
    if (from) qs.set('from', from)
    if (to) qs.set('to', to)
    const q = qs.toString()
    try {
      await downloadFromApi(`/api/financial/export/csv${q ? `?${q}` : ''}`, 'donations-export.csv')
    } catch {
      setCsvError('Export failed. Ensure you are signed in with Financial or Admin access, and that VITE_API_BASE_URL points at the API host in production.')
    }
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
      {trendsError && (
        <p className="text-destructive mb-4 text-sm" role="alert">
          {trendsError}
        </p>
      )}
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

        {csvError && (
          <p className="text-destructive mb-3 text-sm" role="alert">
            {csvError}
          </p>
        )}
        <Button onClick={() => void downloadCsv()}>Download CSV</Button>
      </div>
    </div>
  )
}
