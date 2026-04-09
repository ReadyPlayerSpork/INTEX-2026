import { useEffect, useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import { api } from '@/api/client'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Select, SelectContent, SelectGroup, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { DataTable, type ColumnDef } from '@/components/DataTable'
import { useServerTable } from '@/hooks/useServerTable'
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

const columns: ColumnDef<CaseloadItem>[] = [
  {
    key: 'caseControlNo',
    header: 'Case Control No',
    sortable: true,
    render: (row) => (
      <Link to={`/admin/caseload/${row.residentId}`} className="text-primary underline">
        {row.caseControlNo}
      </Link>
    ),
  },
  { key: 'internalCode', header: 'Internal Code', sortable: true },
  { key: 'safehouseName', header: 'Safehouse', sortable: true },
  { key: 'caseStatus', header: 'Status', sortable: true },
  { key: 'currentRiskLevel', header: 'Risk Level', sortable: true },
  {
    key: 'assignedSocialWorker',
    header: 'Assigned Worker',
    sortable: true,
    render: (row) => row.assignedSocialWorker ?? '-',
  },
  { key: 'dateOfAdmission', header: 'Admission Date', sortable: true },
]

export function CaseloadPage() {
  const [search, setSearch] = useState('')
  const [statusFilter, setStatusFilter] = useState('')
  const [riskFilter, setRiskFilter] = useState('')
  const [safehouseFilter, setSafehouseFilter] = useState('')
  const [safehouses, setSafehouses] = useState<SafehouseOption[]>([])
  const [showCreate, setShowCreate] = useState(false)
  const [editTarget, setEditTarget] = useState<CaseloadItem | null>(null)
  const [editInitial, setEditInitial] = useState<Partial<CreateResidentRequest> | null>(null)

  useEffect(() => {
    caseloadApi.getSafehouses().then((res) => setSafehouses(res.items)).catch(() => {})
  }, [])

  const filters = useMemo(
    () => ({
      search,
      status: statusFilter,
      riskLevel: riskFilter,
      safehouseId: safehouseFilter,
    }),
    [search, statusFilter, riskFilter, safehouseFilter],
  )

  const table = useServerTable<CaseloadItem>({
    endpoint: '/api/caseload',
    pageSize: 20,
    defaultSort: 'dateOfAdmission',
    defaultDirection: 'desc',
    filters,
  })

  return (
    <div className="mx-auto max-w-7xl px-4 py-12">
      <div className="mb-6 flex items-center justify-between">
        <h1 className="text-2xl font-bold">Caseload Management</h1>
        <Button onClick={() => setShowCreate(true)}>New Resident</Button>
      </div>

      <div className="mb-4 flex flex-wrap gap-3">
        <Input
          type="text"
          placeholder="Search by name or code..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="w-56"
        />
        <Select value={statusFilter} onValueChange={(v) => setStatusFilter(v ?? '')}>
          <SelectTrigger>
            <SelectValue placeholder="All statuses" />
          </SelectTrigger>
          <SelectContent>
            <SelectGroup>
              <SelectItem value="">All statuses</SelectItem>
              <SelectItem value="Active">Active</SelectItem>
              <SelectItem value="Discharged">Discharged</SelectItem>
              <SelectItem value="Transferred">Transferred</SelectItem>
              <SelectItem value="Pending">Pending</SelectItem>
            </SelectGroup>
          </SelectContent>
        </Select>
        <Select value={riskFilter} onValueChange={(v) => setRiskFilter(v ?? '')}>
          <SelectTrigger>
            <SelectValue placeholder="All risk levels" />
          </SelectTrigger>
          <SelectContent>
            <SelectGroup>
              <SelectItem value="">All risk levels</SelectItem>
              <SelectItem value="Low">Low</SelectItem>
              <SelectItem value="Medium">Medium</SelectItem>
              <SelectItem value="High">High</SelectItem>
              <SelectItem value="Critical">Critical</SelectItem>
            </SelectGroup>
          </SelectContent>
        </Select>
        <Select value={safehouseFilter} onValueChange={(v) => setSafehouseFilter(v ?? '')}>
          <SelectTrigger>
            <SelectValue placeholder="All safehouses" />
          </SelectTrigger>
          <SelectContent>
            <SelectGroup>
              <SelectItem value="">All safehouses</SelectItem>
              {safehouses.map((s) => (
                <SelectItem key={s.safehouseId} value={String(s.safehouseId)}>
                  {s.name}
                </SelectItem>
              ))}
            </SelectGroup>
          </SelectContent>
        </Select>
      </div>

      <DataTable
        columns={columns}
        data={table.items}
        rowKey={(row) => row.residentId}
        sort={table.sort}
        onSort={table.setSort}
        page={table.page}
        totalPages={table.totalPages}
        totalCount={table.totalCount}
        onPageChange={table.setPage}
        loading={table.loading}
        onEdit={async (row) => {
          const full = await api.get<CreateResidentRequest>(`/api/caseload/${row.residentId}`)
          setEditInitial(full)
          setEditTarget(row)
        }}
        onDelete={async (row) => {
          await caseloadApi.deleteResident(row.residentId)
          table.refresh()
        }}
        getCascadeInfo={(row) => caseloadApi.getCascadeInfo(row.residentId)}
        deleteEntityLabel="resident"
        getDeleteName={(row) => `${row.caseControlNo} (${row.internalCode})`}
      />

      {showCreate && (
        <ResidentFormModal
          onSubmit={async (data: CreateResidentRequest) => {
            await caseloadApi.createResident(data)
            setShowCreate(false)
            table.refresh()
          }}
          onClose={() => setShowCreate(false)}
        />
      )}

      {editTarget && (
        <ResidentFormModal
          initial={editInitial}
          onSubmit={async (data: CreateResidentRequest) => {
            await caseloadApi.updateResident(editTarget.residentId, data)
            setEditTarget(null)
            setEditInitial(null)
            table.refresh()
          }}
          onClose={() => { setEditTarget(null); setEditInitial(null) }}
        />
      )}
    </div>
  )
}
