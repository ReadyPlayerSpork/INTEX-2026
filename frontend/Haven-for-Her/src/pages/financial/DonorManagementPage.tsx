import { useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Select, SelectContent, SelectGroup, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { DataTable, type ColumnDef } from '@/components/DataTable'
import { useServerTable } from '@/hooks/useServerTable'
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

const columns: ColumnDef<Donor>[] = [
  {
    key: 'displayName',
    header: 'Name',
    sortable: true,
    render: (row) => (
      <Link to={`/financial/donors/${row.supporterId}`} className="text-primary underline">
        {row.displayName ?? (`${row.firstName ?? ''} ${row.lastName ?? ''}`.trim() || '-')}
      </Link>
    ),
  },
  { key: 'email', header: 'Email', sortable: true, render: (row) => row.email ?? '-' },
  { key: 'supporterType', header: 'Type', sortable: true },
  { key: 'region', header: 'Region', sortable: true, render: (row) => row.region ?? '-' },
  { key: 'acquisitionChannel', header: 'Channel', render: (row) => row.acquisitionChannel ?? '-' },
  { key: 'status', header: 'Status', sortable: true },
  { key: 'firstDonationDate', header: 'First Donation', sortable: true, render: (row) => row.firstDonationDate ?? '-' },
]

export function DonorManagementPage() {
  const [search, setSearch] = useState('')
  const [typeFilter, setTypeFilter] = useState('')
  const [statusFilter, setStatusFilter] = useState('')
  const [showCreate, setShowCreate] = useState(false)
  const [editTarget, setEditTarget] = useState<Donor | null>(null)
  const [editInitial, setEditInitial] = useState<CreateSupporterRequest | null>(null)
  const [showDonation, setShowDonation] = useState(false)

  const filters = useMemo(
    () => ({ search, supporterType: typeFilter, status: statusFilter }),
    [search, typeFilter, statusFilter],
  )

  const table = useServerTable<Donor>({
    endpoint: '/api/financial/donors',
    pageSize: 25,
    defaultSort: 'displayName',
    defaultDirection: 'asc',
    filters,
  })

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
        <Input
          type="text"
          placeholder="Search by name or email..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="w-56"
        />
        <Select value={typeFilter} onValueChange={(v) => setTypeFilter(v ?? '')}>
          <SelectTrigger>
            <SelectValue placeholder="All types" />
          </SelectTrigger>
          <SelectContent>
            <SelectGroup>
              <SelectItem value="">All types</SelectItem>
              <SelectItem value="Individual">Individual</SelectItem>
              <SelectItem value="Organization">Organization</SelectItem>
              <SelectItem value="Anonymous">Anonymous</SelectItem>
            </SelectGroup>
          </SelectContent>
        </Select>
        <Select value={statusFilter} onValueChange={(v) => setStatusFilter(v ?? '')}>
          <SelectTrigger>
            <SelectValue placeholder="All statuses" />
          </SelectTrigger>
          <SelectContent>
            <SelectGroup>
              <SelectItem value="">All statuses</SelectItem>
              <SelectItem value="Active">Active</SelectItem>
              <SelectItem value="Inactive">Inactive</SelectItem>
            </SelectGroup>
          </SelectContent>
        </Select>
      </div>

      <DataTable
        columns={columns}
        data={table.items}
        rowKey={(row) => row.supporterId}
        sort={table.sort}
        onSort={table.setSort}
        page={table.page}
        totalPages={table.totalPages}
        totalCount={table.totalCount}
        onPageChange={table.setPage}
        loading={table.loading}
        onEdit={async (row) => {
          const full = await financialApi.getSupporter(row.supporterId)
          setEditInitial({
            supporterType: full.supporterType,
            displayName: full.displayName,
            organizationName: full.organizationName,
            firstName: full.firstName,
            lastName: full.lastName,
            relationshipType: full.relationshipType,
            region: full.region,
            country: full.country,
            email: full.email,
            phone: full.phone,
            status: full.status,
            acquisitionChannel: full.acquisitionChannel,
          })
          setEditTarget(row)
        }}
        onDelete={async (row) => {
          await financialApi.deleteSupporter(row.supporterId)
          table.refresh()
        }}
        getCascadeInfo={(row) => financialApi.getSupporterCascadeInfo(row.supporterId)}
        deleteEntityLabel="supporter"
        getDeleteName={(row) => row.displayName ?? (`${row.firstName ?? ''} ${row.lastName ?? ''}`.trim() || `Supporter #${row.supporterId}`)}
      />

      {showCreate && (
        <SupporterFormModal
          onSubmit={async (data: CreateSupporterRequest) => {
            await financialApi.createSupporter(data)
            setShowCreate(false)
            table.refresh()
          }}
          onClose={() => setShowCreate(false)}
        />
      )}

      {editTarget && (
        <SupporterFormModal
          initial={editInitial}
          onSubmit={async (data: CreateSupporterRequest) => {
            await financialApi.updateSupporter(editTarget.supporterId, data)
            setEditTarget(null)
            setEditInitial(null)
            table.refresh()
          }}
          onClose={() => { setEditTarget(null); setEditInitial(null) }}
        />
      )}

      {showDonation && (
        <RecordDonationModal
          onSubmit={async (data) => {
            await financialApi.recordDonation(data)
            setShowDonation(false)
            table.refresh()
          }}
          onClose={() => setShowDonation(false)}
        />
      )}
    </div>
  )
}
