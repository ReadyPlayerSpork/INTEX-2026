import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { api } from '@/api/client'
import { Button } from '@/components/ui/button'

interface DonorDashboard {
  totalDonations: number
  totalMonetaryPhp: number
  recurringDonations: number
  recentDonations: {
    donationId: number
    donationType: string
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

  return (
    <div className="mx-auto max-w-7xl px-4 py-12">
      <div className="mb-8 flex items-center justify-between">
        <h1 className="text-2xl font-bold">Donor Dashboard</h1>
        <Link to="/donate">
          <Button>Make a donation</Button>
        </Link>
      </div>

      <div className="mb-8 grid grid-cols-3 gap-6">
        <Stat label="Total donations" value={data.totalDonations} />
        <Stat
          label="Total giving (PHP)"
          value={`₱${data.totalMonetaryPhp.toLocaleString()}`}
        />
        <Stat label="Recurring" value={data.recurringDonations} />
      </div>

      <h2 className="mb-4 text-lg font-semibold">Recent Donations</h2>
      {data.recentDonations.length === 0 ? (
        <p className="text-muted-foreground text-sm">No donations yet.</p>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-border border-b text-left">
                <th className="px-3 py-2 font-medium">Date</th>
                <th className="px-3 py-2 font-medium">Type</th>
                <th className="px-3 py-2 font-medium">Amount</th>
                <th className="px-3 py-2 font-medium">Campaign</th>
                <th className="px-3 py-2 font-medium">Recurring</th>
              </tr>
            </thead>
            <tbody>
              {data.recentDonations.map((d) => (
                <tr key={d.donationId} className="border-border border-b">
                  <td className="px-3 py-2">{d.donationDate}</td>
                  <td className="px-3 py-2">{d.donationType}</td>
                  <td className="px-3 py-2">
                    {d.amount != null
                      ? `${d.currencyCode} ${d.amount.toLocaleString()}`
                      : '-'}
                  </td>
                  <td className="px-3 py-2">{d.campaignName ?? '-'}</td>
                  <td className="px-3 py-2">{d.isRecurring ? 'Yes' : 'No'}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  )
}

function Stat({ label, value }: { label: string; value: string | number }) {
  return (
    <div className="bg-card border-border rounded-lg border p-6 text-center">
      <p className="text-primary text-3xl font-bold">{value}</p>
      <p className="text-muted-foreground mt-1 text-sm">{label}</p>
    </div>
  )
}
