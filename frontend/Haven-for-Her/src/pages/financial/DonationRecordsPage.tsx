import { useMemo, useState } from 'react'
import { Input } from '@/components/ui/input'
import { Select, SelectContent, SelectGroup, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { DataTable, type ColumnDef } from '@/components/DataTable'
import { useServerTable } from '@/hooks/useServerTable'
import { financialApi } from '@/api/financialApi'

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

const columns: ColumnDef<DonationRecord>[] = [
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
  { key: 'isRecurring', header: 'Recurring', render: (row) => (row.isRecurring ? 'Yes' : 'No') },
]

export function DonationRecordsPage() {
  const [typeFilter, setTypeFilter] = useState('')
  const [campaignFilter, setCampaignFilter] = useState('')

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
      <h1 className="mb-6 text-2xl font-bold">Donation Records</h1>

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
        onDelete={async (row) => {
          await financialApi.deleteDonation(row.donationId)
          table.refresh()
        }}
        getCascadeInfo={(row) => financialApi.getDonationCascadeInfo(row.donationId)}
        deleteEntityLabel="donation"
        getDeleteName={(row) => `${row.donationType} on ${row.donationDate}${row.amount != null ? ` (${row.currencyCode} ${row.amount.toLocaleString()})` : ''}`}
      />
    </div>
  )
}
