import { useCallback, useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { api } from '@/api/client'
import { Button } from '@/components/ui/button'
import type { PaginatedResponse } from '@/api/types'
import { financialApi, type CreateSupporterRequest } from '@/api/financialApi'
import { SupporterFormModal } from '@/components/financial/SupporterFormModal'
import { RecordDonationModal } from '@/components/financial/RecordDonationModal'

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
  const [typeFilter, setTypeFilter] = useState('')
  const [statusFilter, setStatusFilter] = useState('')
  const [showCreate, setShowCreate] = useState(false)
  const [showDonation, setShowDonation] = useState(false)
  const pageSize = 25

  const fetchDonors = useCallback(async () => {
    setLoading(true)
    try {
      const qs = new URLSearchParams({ page: String(page), pageSize: String(pageSize) })
      if (search) qs.set('search', search)
      const res = await api.get<PaginatedResponse<Donor>>(
        `/api/financial/donors?${qs}`,
      )
      let filtered = res.items
      if (typeFilter) filtered = filtered.filter((d) => d.supporterType === typeFilter)
      if (statusFilter) filtered = filtered.filter((d) => d.status === statusFilter)
      setDonors(filtered)
      setTotalCount(res.totalCount)
    } catch {
      // ignore
    } finally {
      setLoading(false)
    }
  }, [search, page, typeFilter, statusFilter])

  useEffect(() => {
    void fetchDonors()
  }, [fetchDonors])

  const totalPages = Math.ceil(totalCount / pageSize)

  return (
    <div className="mx-auto max-w-7xl px-4 py-12">
      <div className="mb-6 flex items-center justify-between">
        <h1 className="text-2xl font-bold">Donor Management</h1>
        <div className="flex gap-2">
          <Button variant="outline" onClick={() => setShowDonation(true)}>Record Donation</Button>
          <Button onClick={() => setShowCreate(true)}>New Supporter</Button>
        </div>
      </div>

      <div className="mb-4 flex flex-wrap gap-3">
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
        <select value={typeFilter} onChange={(e) => { setTypeFilter(e.target.value); setPage(1) }} className="border-input bg-background rounded-md border px-3 py-2 text-sm">
          <option value="">All types</option>
          <option value="Individual">Individual</option>
          <option value="Organization">Organization</option>
          <option value="Anonymous">Anonymous</option>
        </select>
        <select value={statusFilter} onChange={(e) => { setStatusFilter(e.target.value); setPage(1) }} className="border-input bg-background rounded-md border px-3 py-2 text-sm">
          <option value="">All statuses</option>
          <option value="Active">Active</option>
          <option value="Inactive">Inactive</option>
        </select>
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
                  <tr key={d.supporterId} className="border-border hover:bg-muted/50 border-b">
                    <td className="px-3 py-2">
                      <Link to={`/financial/donors/${d.supporterId}`} className="text-primary underline">
                        {d.displayName ?? (`${d.firstName ?? ''} ${d.lastName ?? ''}`.trim() || '-')}
                      </Link>
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

      {showCreate && (
        <SupporterFormModal
          onSubmit={async (data: CreateSupporterRequest) => {
            await financialApi.createSupporter(data)
            setShowCreate(false)
            void fetchDonors()
          }}
          onClose={() => setShowCreate(false)}
        />
      )}

      {showDonation && (
        <RecordDonationModal
          onSubmit={async (data) => {
            await financialApi.recordDonation(data)
            setShowDonation(false)
            void fetchDonors()
          }}
          onClose={() => setShowDonation(false)}
        />
      )}
    </div>
  )
}
