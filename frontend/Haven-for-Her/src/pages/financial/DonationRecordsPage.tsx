import { useCallback, useEffect, useState } from 'react'
import { api } from '@/api/client'
import { Button } from '@/components/ui/button'
import type { PaginatedResponse } from '@/api/types'

interface DonationRecord {
  donationId: number
  supporterId: number | null
  donationType: string
  donationDate: string
  amount: number | null
  estimatedValue: number | null
  currencyCode: string
  campaignName: string | null
  channelSource: string | null
  isRecurring: boolean
}

export function DonationRecordsPage() {
  const [donations, setDonations] = useState<DonationRecord[]>([])
  const [typeFilter, setTypeFilter] = useState('')
  const [campaignFilter, setCampaignFilter] = useState('')
  const [page, setPage] = useState(1)
  const [totalCount, setTotalCount] = useState(0)
  const [loading, setLoading] = useState(true)
  const pageSize = 25

  const fetchDonations = useCallback(async () => {
    setLoading(true)
    try {
      const qs = new URLSearchParams({ page: String(page), pageSize: String(pageSize) })
      if (typeFilter) qs.set('type', typeFilter)
      if (campaignFilter) qs.set('campaign', campaignFilter)
      const res = await api.get<PaginatedResponse<DonationRecord>>(
        `/api/financial/donations?${qs}`,
      )
      setDonations(res.items)
      setTotalCount(res.totalCount)
    } catch {
      // ignore
    } finally {
      setLoading(false)
    }
  }, [typeFilter, campaignFilter, page])

  useEffect(() => {
    void fetchDonations()
  }, [fetchDonations])

  const totalPages = Math.ceil(totalCount / pageSize)

  return (
    <div className="mx-auto max-w-7xl px-4 py-12">
      <h1 className="mb-6 text-2xl font-bold">Donation Records</h1>

      <div className="mb-4 flex gap-3">
        <select
          value={typeFilter}
          onChange={(e) => { setTypeFilter(e.target.value); setPage(1) }}
          className="border-input bg-background rounded-md border px-3 py-2 text-sm"
        >
          <option value="">All types</option>
          <option value="Monetary">Monetary</option>
          <option value="InKind">In-Kind</option>
          <option value="Time">Time</option>
          <option value="Skills">Skills</option>
          <option value="SocialMedia">SocialMedia</option>
        </select>
        <input
          type="text"
          placeholder="Filter by campaign..."
          value={campaignFilter}
          onChange={(e) => { setCampaignFilter(e.target.value); setPage(1) }}
          className="border-input bg-background rounded-md border px-3 py-2 text-sm"
        />
      </div>

      {loading ? (
        <p className="text-muted-foreground animate-pulse">Loading...</p>
      ) : (
        <>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-border border-b text-left">
                  <th className="px-3 py-2 font-medium">ID</th>
                  <th className="px-3 py-2 font-medium">Date</th>
                  <th className="px-3 py-2 font-medium">Type</th>
                  <th className="px-3 py-2 font-medium">Amount</th>
                  <th className="px-3 py-2 font-medium">Campaign</th>
                  <th className="px-3 py-2 font-medium">Channel</th>
                  <th className="px-3 py-2 font-medium">Recurring</th>
                </tr>
              </thead>
              <tbody>
                {donations.map((d) => (
                  <tr key={d.donationId} className="border-border border-b">
                    <td className="px-3 py-2">{d.donationId}</td>
                    <td className="px-3 py-2">{d.donationDate}</td>
                    <td className="px-3 py-2">{d.donationType}</td>
                    <td className="px-3 py-2">
                      {d.amount != null
                        ? `${d.currencyCode} ${d.amount.toLocaleString()}`
                        : d.estimatedValue != null
                          ? `~${d.currencyCode} ${d.estimatedValue.toLocaleString()}`
                          : '-'}
                    </td>
                    <td className="px-3 py-2">{d.campaignName ?? '-'}</td>
                    <td className="px-3 py-2">{d.channelSource ?? '-'}</td>
                    <td className="px-3 py-2">{d.isRecurring ? 'Yes' : 'No'}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {totalPages > 1 && (
            <div className="mt-4 flex items-center justify-between">
              <p className="text-muted-foreground text-sm">
                Page {page} of {totalPages} ({totalCount} records)
              </p>
              <div className="flex gap-2">
                <Button variant="outline" size="sm" disabled={page <= 1} onClick={() => setPage((p) => p - 1)}>
                  Previous
                </Button>
                <Button variant="outline" size="sm" disabled={page >= totalPages} onClick={() => setPage((p) => p + 1)}>
                  Next
                </Button>
              </div>
            </div>
          )}
        </>
      )}
    </div>
  )
}
