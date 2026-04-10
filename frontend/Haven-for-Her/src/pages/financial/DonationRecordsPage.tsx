import { useMemo, useState } from 'react'
import { useAuth } from '@/hooks/useAuth'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Select, SelectContent, SelectGroup, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { DataTable, type ColumnDef } from '@/components/DataTable'
import { useServerTable } from '@/hooks/useServerTable'
import { financialApi } from '@/api/financialApi'
import { RecordDonationModal } from '@/components/financial/RecordDonationModal'
import { EditDonationModal } from './components/EditDonationModal'
import { AllocateDonationModal } from './components/AllocateDonationModal'

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
  const { hasRole } = useAuth()
  const isAdmin = hasRole('Admin')
  const [typeFilter, setTypeFilter] = useState('')
  const [campaignFilter, setCampaignFilter] = useState('')
  const [showDonation, setShowDonation] = useState(false)
  const [editDonation, setEditDonation] = useState<DonationRecord | null>(null)
  const [allocateDonation, setAllocateDonation] = useState<DonationRecord | null>(null)

  const columns: ColumnDef<DonationRecord>[] = useMemo(() => [
    { key: 'donationId', header: 'ID', sortable: true },
    { key: 'donationDate', header: 'Date', sortable: true },
    { key: 'donationType', header: 'Type', sortable: true },
    {
      key: 'amount',
      header: 'Amount',
      sortable: true,
      render: (row) =>
        row.amount != null
          ? `${row.currencyCode} ${row.amount.toLocaleString()}`
          : row.estimatedValue != null
            ? `~${row.currencyCode} ${row.estimatedValue.toLocaleString()}`
            : '-',
    },
    { key: 'campaignName', header: 'Campaign', sortable: true, render: (row) => row.campaignName ?? '-' },
    { key: 'channelSource', header: 'Channel', render: (row) => row.channelSource ?? '-' },
    {
      key: 'actions',
      header: 'Allocation',
      render: (row) => 
        row.donationType === 'Monetary' && row.amount ? (
          <Button variant="ghost" size="sm" className="text-primary h-8" onClick={() => setAllocateDonation(row)}>
            Allocate
          </Button>
        ) : null
    }
  ], [])

  const filters = useMemo(
    () => ({ type: typeFilter, campaign: campaignFilter }),
    [typeFilter, campaignFilter],
  )

  const table = useServerTable<DonationRecord>({
    endpoint: '/api/financial/donations',
    pageSize: 25,
    defaultSort: 'donationDate',
    defaultDirection: 'desc',
    filters,
  })

  return (
    <div className="mx-auto max-w-7xl px-4 py-12">
      <div className="mb-6 flex items-center justify-between">
        <h1 className="text-2xl font-bold">Donation Records</h1>
        <Button variant="outline" onClick={() => setShowDonation(true)}>
          Record Donation
        </Button>
      </div>

      <div className="mb-4 flex flex-wrap gap-3">
        <Select value={typeFilter} onValueChange={(v) => setTypeFilter(v ?? '')}>
          <SelectTrigger>
            <SelectValue placeholder="All types" />
          </SelectTrigger>
          <SelectContent>
            <SelectGroup>
              <SelectItem value="">All types</SelectItem>
              <SelectItem value="Monetary">Monetary</SelectItem>
              <SelectItem value="InKind">In-Kind</SelectItem>
              <SelectItem value="Time">Time</SelectItem>
              <SelectItem value="Skills">Skills</SelectItem>
              <SelectItem value="SocialMedia">SocialMedia</SelectItem>
            </SelectGroup>
          </SelectContent>
        </Select>
        <Input
          type="text"
          placeholder="Filter by campaign..."
          value={campaignFilter}
          onChange={(e) => setCampaignFilter(e.target.value)}
          className="w-48"
        />
      </div>

      <DataTable
        columns={columns}
        data={table.items}
        rowKey={(row) => row.donationId}
        sort={table.sort}
        onSort={table.setSort}
        page={table.page}
        totalPages={table.totalPages}
        totalCount={table.totalCount}
        onPageChange={table.setPage}
        loading={table.loading}
        onEdit={(row) => setEditDonation(row)}
        onDelete={
          isAdmin
            ? async (row) => {
                await financialApi.deleteDonation(row.donationId)
                table.refresh()
              }
            : undefined
        }
        getCascadeInfo={isAdmin ? (row) => financialApi.getDonationCascadeInfo(row.donationId) : undefined}
        deleteEntityLabel="donation"
        getDeleteName={(row) => `${row.donationType} on ${row.donationDate}${row.amount != null ? ` (${row.currencyCode} ${row.amount.toLocaleString()})` : ''}`}
      />

      <EditDonationModal
        donation={editDonation}
        open={!!editDonation}
        onOpenChange={(open) => !open && setEditDonation(null)}
        onSaved={table.refresh}
      />

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

      {allocateDonation && (
        <AllocateDonationModal
          donationId={allocateDonation.donationId}
          donationAmount={allocateDonation.amount ?? 0}
          currencyCode={allocateDonation.currencyCode}
          onClose={() => setAllocateDonation(null)}
          onSaved={table.refresh}
        />
      )}
    </div>
  )
}
