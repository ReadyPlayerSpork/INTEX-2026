import { useCallback, useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { api } from '@/api/client'
import { Button } from '@/components/ui/button'
import type { PaginatedResponse } from '@/api/types'

interface CaseloadItem {
  residentId: number
  caseControlNo: string
  internalCode: string
  safehouseName: string
  status: string
  riskLevel: string
  assignedWorker: string | null
  admissionDate: string
}

export function CaseloadPage() {
  const [items, setItems] = useState<CaseloadItem[]>([])
  const [page, setPage] = useState(1)
  const [totalCount, setTotalCount] = useState(0)
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [statusFilter, setStatusFilter] = useState('')
  const [riskFilter, setRiskFilter] = useState('')
  const pageSize = 20

  const fetchCaseload = useCallback(async () => {
    setLoading(true)
    try {
      const qs = new URLSearchParams({ page: String(page), pageSize: String(pageSize) })
      if (search) qs.set('search', search)
      if (statusFilter) qs.set('status', statusFilter)
      if (riskFilter) qs.set('riskLevel', riskFilter)
      const res = await api.get<PaginatedResponse<CaseloadItem>>(`/api/caseload?${qs}`)
      setItems(res.items)
      setTotalCount(res.totalCount)
    } catch {
      // ignore
    } finally {
      setLoading(false)
    }
  }, [page, search, statusFilter, riskFilter])

  useEffect(() => {
    void fetchCaseload()
  }, [fetchCaseload])

  const totalPages = Math.ceil(totalCount / pageSize)

  return (
    <div className="mx-auto max-w-7xl px-4 py-12">
      <h1 className="mb-6 text-2xl font-bold">Caseload Management</h1>

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
                    <td className="px-3 py-2">{item.status}</td>
                    <td className="px-3 py-2">{item.riskLevel}</td>
                    <td className="px-3 py-2">{item.assignedWorker ?? '-'}</td>
                    <td className="px-3 py-2">{item.admissionDate}</td>
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
