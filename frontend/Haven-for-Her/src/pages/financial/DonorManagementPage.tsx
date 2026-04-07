import { useCallback, useEffect, useState } from 'react'
import { api } from '@/api/client'
import { Button } from '@/components/ui/button'
import type { PaginatedResponse } from '@/api/types'

interface Donor {
  supporterId: number
  displayName: string | null
  firstName: string | null
  lastName: string | null
  email: string | null
  supporterType: string
  relationshipType: string | null
  region: string | null
  country: string | null
  status: string
  acquisitionChannel: string | null
  firstDonationDate: string | null
}

export function DonorManagementPage() {
  const [donors, setDonors] = useState<Donor[]>([])
  const [search, setSearch] = useState('')
  const [page, setPage] = useState(1)
  const [totalCount, setTotalCount] = useState(0)
  const [loading, setLoading] = useState(true)
  const pageSize = 25

  const fetchDonors = useCallback(async () => {
    setLoading(true)
    try {
      const qs = new URLSearchParams({ page: String(page), pageSize: String(pageSize) })
      if (search) qs.set('search', search)
      const res = await api.get<PaginatedResponse<Donor>>(
        `/api/financial/donors?${qs}`,
      )
      setDonors(res.items)
      setTotalCount(res.totalCount)
    } catch {
      // ignore
    } finally {
      setLoading(false)
    }
  }, [search, page])

  useEffect(() => {
    void fetchDonors()
  }, [fetchDonors])

  const totalPages = Math.ceil(totalCount / pageSize)

  return (
    <div className="mx-auto max-w-7xl px-4 py-12">
      <h1 className="mb-6 text-2xl font-bold">Donor Management</h1>

      <div className="mb-4">
        <input
          type="text"
          placeholder="Search by name or email..."
          value={search}
          onChange={(e) => {
            setSearch(e.target.value)
            setPage(1)
          }}
          className="border-input bg-background w-full max-w-sm rounded-md border px-3 py-2 text-sm"
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
                  <th className="px-3 py-2 font-medium">Name</th>
                  <th className="px-3 py-2 font-medium">Email</th>
                  <th className="px-3 py-2 font-medium">Type</th>
                  <th className="px-3 py-2 font-medium">Region</th>
                  <th className="px-3 py-2 font-medium">Channel</th>
                  <th className="px-3 py-2 font-medium">Status</th>
                  <th className="px-3 py-2 font-medium">First Donation</th>
                </tr>
              </thead>
              <tbody>
                {donors.map((d) => (
                  <tr key={d.supporterId} className="border-border border-b">
                    <td className="px-3 py-2">
                      {d.displayName ?? (`${d.firstName ?? ''} ${d.lastName ?? ''}`.trim() || '-')}
                    </td>
                    <td className="px-3 py-2">{d.email ?? '-'}</td>
                    <td className="px-3 py-2">{d.supporterType}</td>
                    <td className="px-3 py-2">{d.region ?? '-'}</td>
                    <td className="px-3 py-2">{d.acquisitionChannel ?? '-'}</td>
                    <td className="px-3 py-2">{d.status}</td>
                    <td className="px-3 py-2">{d.firstDonationDate ?? '-'}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {totalPages > 1 && (
            <div className="mt-4 flex items-center justify-between">
              <p className="text-muted-foreground text-sm">
                Page {page} of {totalPages} ({totalCount} donors)
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
