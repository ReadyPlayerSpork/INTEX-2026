import { useCallback, useEffect, useState } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { reportsApi, type DonationTrend } from '@/api/reportsApi'
import { TrendChart } from '@/components/shared/TrendChart'
import { financialApi, type AllocationsResponse } from '@/api/financialApi'
import { AllocationBreakdown } from '@/components/financial/AllocationBreakdown'
import { api } from '@/api/client'
import { Download } from 'lucide-react'

const MONTH_NAMES = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec']

export function ReportsPage() {
  const [from, setFrom] = useState('')
  const [to, setTo] = useState('')
  const [trends, setTrends] = useState<DonationTrend[]>([])
  const [allocations, setAllocations] = useState<AllocationsResponse | null>(null)
  const [loadingTrends, setLoadingTrends] = useState(true)
  const [downloading, setDownloading] = useState(false)

  const fetchData = useCallback(async () => {
    setLoadingTrends(true)
    // Fetch independently so one failure doesn't block the other
    const [trendsResult, allocResult] = await Promise.allSettled([
      reportsApi.getDonationTrends(12),
      financialApi.getAllocations(),
    ])
    if (trendsResult.status === 'fulfilled') setTrends(trendsResult.value)
    if (allocResult.status === 'fulfilled') setAllocations(allocResult.value)
    setLoadingTrends(false)
  }, [])

  useEffect(() => { void fetchData() }, [fetchData])

  const canDownload = from !== '' && to !== ''

  const downloadCsv = async () => {
    if (!canDownload) return
    setDownloading(true)
    try {
      const qs = new URLSearchParams({ from, to })
      const blob = await api.getBlob(`/api/financial/export/csv?${qs}`)
      const url = URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = 'donations-export.csv'
      document.body.appendChild(a)
      a.click()
      a.remove()
      URL.revokeObjectURL(url)
    } catch {
      // download failed — browser will show nothing
    } finally {
      setDownloading(false)
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
      <Card>
        <CardHeader>
          <CardTitle className="font-heading text-lg text-plum">Donation Export (CSV)</CardTitle>
          <CardDescription>
            Select a date range then download all matching donations as a CSV file.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="mb-4 grid gap-4 sm:grid-cols-2">
            <div className="flex flex-col gap-1.5">
              <Label htmlFor="export-from">From date</Label>
              <Input
                id="export-from"
                type="date"
                value={from}
                onChange={(e) => setFrom(e.target.value)}
              />
            </div>
            <div className="flex flex-col gap-1.5">
              <Label htmlFor="export-to">To date</Label>
              <Input
                id="export-to"
                type="date"
                value={to}
                onChange={(e) => setTo(e.target.value)}
              />
            </div>
          </div>

          <Button onClick={downloadCsv} disabled={!canDownload || downloading}>
            <Download data-icon="inline-start" />
            {downloading ? 'Downloading...' : 'Download CSV'}
          </Button>
        </CardContent>
      </Card>
    </div>
  )
}
