import { useState } from 'react'
import { Button } from '@/components/ui/button'

export function ReportsPage() {
  const [from, setFrom] = useState('')
  const [to, setTo] = useState('')

  const downloadCsv = () => {
    const qs = new URLSearchParams()
    if (from) qs.set('from', from)
    if (to) qs.set('to', to)
    window.open(`/api/financial/export/csv?${qs}`, '_blank')
  }

  return (
    <div className="mx-auto max-w-3xl px-4 py-12">
      <h1 className="mb-6 text-2xl font-bold">Export Reports</h1>

      <div className="bg-card border-border rounded-lg border p-6">
        <h2 className="mb-4 text-lg font-semibold">Donation Export (CSV)</h2>
        <p className="text-muted-foreground mb-4 text-sm">
          Download all donations for a date range as a CSV file.
        </p>

        <div className="mb-4 grid gap-4 sm:grid-cols-2">
          <label className="flex flex-col gap-1">
            <span className="text-sm font-medium">From date</span>
            <input
              type="date"
              value={from}
              onChange={(e) => setFrom(e.target.value)}
              className="border-input bg-background rounded-md border px-3 py-2 text-sm"
            />
          </label>
          <label className="flex flex-col gap-1">
            <span className="text-sm font-medium">To date</span>
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
