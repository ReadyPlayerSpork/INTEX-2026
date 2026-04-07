import { useEffect, useState } from 'react'
import { api } from '@/api/client'

interface Insights {
  activeDonors: number
  lapsedDonors: number
  topDonors: { supporterId: number; total: number; count: number }[]
}

export function InsightsPage() {
  const [data, setData] = useState<Insights | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    api
      .get<Insights>('/api/financial/insights')
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
        <p className="text-muted-foreground">Unable to load insights.</p>
      </div>
    )
  }

  return (
    <div className="mx-auto max-w-7xl px-4 py-12">
      <h1 className="mb-8 text-2xl font-bold">Donor Retention Insights</h1>

      <div className="mb-8 grid grid-cols-2 gap-6 sm:grid-cols-3">
        <div className="bg-card border-border rounded-lg border p-6 text-center">
          <p className="text-3xl font-bold text-green-600">{data.activeDonors}</p>
          <p className="text-muted-foreground mt-1 text-sm">
            Active donors (last 6 months)
          </p>
        </div>
        <div className="bg-card border-border rounded-lg border p-6 text-center">
          <p className="text-3xl font-bold text-yellow-600">{data.lapsedDonors}</p>
          <p className="text-muted-foreground mt-1 text-sm">
            Lapsed donors (6-12 months)
          </p>
        </div>
        <div className="bg-card border-border rounded-lg border p-6 text-center">
          <p className="text-muted-foreground text-sm">
            ML churn predictions will appear here once Pipeline 1 is deployed.
          </p>
        </div>
      </div>

      <h2 className="mb-4 text-lg font-semibold">Top Donors by Total Giving</h2>
      {data.topDonors.length === 0 ? (
        <p className="text-muted-foreground text-sm">No donor data available.</p>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-border border-b text-left">
                <th className="px-3 py-2 font-medium">#</th>
                <th className="px-3 py-2 font-medium">Supporter ID</th>
                <th className="px-3 py-2 font-medium">Total (PHP)</th>
                <th className="px-3 py-2 font-medium">Donations</th>
              </tr>
            </thead>
            <tbody>
              {data.topDonors.map((d, i) => (
                <tr key={d.supporterId} className="border-border border-b">
                  <td className="px-3 py-2">{i + 1}</td>
                  <td className="px-3 py-2">{d.supporterId}</td>
                  <td className="px-3 py-2">₱{d.total.toLocaleString()}</td>
                  <td className="px-3 py-2">{d.count}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  )
}
