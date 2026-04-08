import { useCallback, useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { api } from '@/api/client'
import { Button } from '@/components/ui/button'
import type { PaginatedResponse } from '@/api/types'
import { caseloadApi, type CreateResidentRequest, type SafehouseOption } from '@/api/caseloadApi'
import { ResidentFormModal } from '@/components/admin/ResidentFormModal'

interface CaseloadItem {
  residentId: number
  caseControlNo: string
  internalCode: string
  safehouseName: string
  caseStatus: string
  currentRiskLevel: string
  assignedSocialWorker: string | null
  dateOfAdmission: string
  sex: string | null
  caseCategory: string | null
  initialRiskLevel: string | null
  reintegrationStatus: string | null
}

export function CaseloadPage() {
  const [items, setItems] = useState<CaseloadItem[]>([])
  const [page, setPage] = useState(1)
  const [totalCount, setTotalCount] = useState(0)
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [statusFilter, setStatusFilter] = useState('')
  const [riskFilter, setRiskFilter] = useState('')
  const [safehouseFilter, setSafehouseFilter] = useState('')
  const [safehouses, setSafehouses] = useState<SafehouseOption[]>([])
  const [showCreate, setShowCreate] = useState(false)
  const pageSize = 20

  useEffect(() => {
    caseloadApi.getSafehouses().then((res) => setSafehouses(res.items)).catch(() => {})
  }, [])

  const fetchCaseload = useCallback(async () => {
    setLoading(true)
    try {
      const qs = new URLSearchParams({ page: String(page), pageSize: String(pageSize) })
      if (search) qs.set('search', search)
      if (statusFilter) qs.set('status', statusFilter)
      if (riskFilter) qs.set('riskLevel', riskFilter)
      if (safehouseFilter) qs.set('safehouseId', safehouseFilter)
      const res = await api.get<PaginatedResponse<CaseloadItem>>(`/api/caseload?${qs}`)
      setItems(res.items)
      setTotalCount(res.totalCount)
    } catch {
      // ignore
    } finally {
      setLoading(false)
    }
  }, [page, search, statusFilter, riskFilter, safehouseFilter])

  useEffect(() => {
    void fetchCaseload()
  }, [fetchCaseload])

  const totalPages = Math.ceil(totalCount / pageSize)

  return (
    <div className="mx-auto max-w-7xl px-4 py-12">
      <div className="mb-6 flex items-center justify-between">
        <h1 className="text-2xl font-bold">Caseload Management</h1>
        <Button onClick={() => setShowCreate(true)}>New Resident</Button>
      </div>

      <div className="mb-4 flex flex-wrap gap-3">
        <input
          type="text"
          placeholder="Search by name or code..."
          value={search}
          onChange={(e) => { setSearch(e.target.value); setPage(1) }}
          className="border-input bg-background rounded-md border px-3 py-2 text-sm"
        />
        <select
          value={statusFilter}
          onChange={(e) => { setStatusFilter(e.target.value); setPage(1) }}
          className="border-input bg-background rounded-md border px-3 py-2 text-sm"
        >
          <option value="">All statuses</option>
          <option value="Active">Active</option>
          <option value="Discharged">Discharged</option>
          <option value="Transferred">Transferred</option>
          <option value="Pending">Pending</option>
        </select>
        <select
          value={riskFilter}
          onChange={(e) => { setRiskFilter(e.target.value); setPage(1) }}
          className="border-input bg-background rounded-md border px-3 py-2 text-sm"
        >
          <option value="">All risk levels</option>
          <option value="Low">Low</option>
          <option value="Medium">Medium</option>
          <option value="High">High</option>
          <option value="Critical">Critical</option>
        </select>
        <select
          value={safehouseFilter}
          onChange={(e) => { setSafehouseFilter(e.target.value); setPage(1) }}
          className="border-input bg-background rounded-md border px-3 py-2 text-sm"
        >
          <option value="">All safehouses</option>
          {safehouses.map((s) => <option key={s.safehouseId} value={s.safehouseId}>{s.name}</option>)}
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
                  <th className="px-3 py-2 font-medium">Case Control No</th>
                  <th className="px-3 py-2 font-medium">Internal Code</th>
                  <th className="px-3 py-2 font-medium">Safehouse</th>
                  <th className="px-3 py-2 font-medium">Status</th>
                  <th className="px-3 py-2 font-medium">Risk Level</th>
                  <th className="px-3 py-2 font-medium">Assigned Worker</th>
                  <th className="px-3 py-2 font-medium">Admission Date</th>
                </tr>
              </thead>
              <tbody>
                {items.map((item) => (
                  <tr key={item.residentId} className="border-border hover:bg-muted/50 border-b">
                    <td className="px-3 py-2">
                      <Link to={`/admin/caseload/${item.residentId}`} className="text-primary underline">
                        {item.caseControlNo}
                      </Link>
                    </td>
                    <td className="px-3 py-2">{item.internalCode}</td>
                    <td className="px-3 py-2">{item.safehouseName}</td>
                    <td className="px-3 py-2">{item.caseStatus}</td>
                    <td className="px-3 py-2">{item.currentRiskLevel}</td>
                    <td className="px-3 py-2">{item.assignedSocialWorker ?? '-'}</td>
                    <td className="px-3 py-2">{item.dateOfAdmission}</td>
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

      {showCreate && (
        <ResidentFormModal
          onSubmit={async (data: CreateResidentRequest) => {
            await caseloadApi.createResident(data)
            setShowCreate(false)
            void fetchCaseload()
          }}
          onClose={() => setShowCreate(false)}
        />
      )}
    </div>
  )
}
