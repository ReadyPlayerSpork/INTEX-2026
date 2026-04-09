import { useMemo, useState } from 'react'
import { api } from '@/api/client'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Select, SelectContent, SelectGroup, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { DataTable, type ColumnDef } from '@/components/DataTable'
import { useServerTable } from '@/hooks/useServerTable'
import { counselorApi } from '@/api/counselorApi'

interface Visitation {
  familyVisitationTrackingId: number
  residentId: number
  visitDate: string
  visitType: string
  locationVisited: string | null
  visitOutcome: string | null
  safetyConcernsNoted: boolean
  followUpNeeded: boolean
}

const EMPTY_FORM = {
  residentId: '',
  visitDate: '',
  visitType: '',
  locationVisited: '',
  familyMembersPresent: '',
  purpose: '',
  observations: '',
  familyCooperationLevel: '',
  safetyConcernsNoted: false,
  followUpNeeded: false,
  followUpNotes: '',
  visitOutcome: '',
}

const columns: ColumnDef<Visitation>[] = [
  { key: 'visitDate', header: 'Date', sortable: true },
  { key: 'residentId', header: 'Resident ID', sortable: true },
  { key: 'visitType', header: 'Type', sortable: true },
  { key: 'locationVisited', header: 'Location', render: (row) => row.locationVisited ?? '-' },
  { key: 'visitOutcome', header: 'Outcome', sortable: true, render: (row) => row.visitOutcome ?? '-' },
  {
    key: 'safetyConcernsNoted',
    header: 'Safety Concerns',
    render: (row) =>
      row.safetyConcernsNoted ? <span className="font-medium text-destructive">Yes</span> : 'No',
  },
  {
    key: 'followUpNeeded',
    header: 'Follow-Up',
    render: (row) => (row.followUpNeeded ? 'Yes' : 'No'),
  },
]

export function VisitationsPage() {
  const [showForm, setShowForm] = useState(false)
  const [form, setForm] = useState(EMPTY_FORM)
  const [submitting, setSubmitting] = useState(false)
  const [filterType, setFilterType] = useState('')
  const [filterDateFrom, setFilterDateFrom] = useState('')
  const [filterDateTo, setFilterDateTo] = useState('')

  const filters = useMemo(
    () => ({
      visitType: filterType,
      dateFrom: filterDateFrom,
      dateTo: filterDateTo,
    }),
    [filterType, filterDateFrom, filterDateTo],
  )

  const table = useServerTable<Visitation>({
    endpoint: '/api/counselor/visitations',
    pageSize: 20,
    defaultSort: 'visitDate',
    defaultDirection: 'desc',
    filters,
  })

  function handleChange(e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) {
    const target = e.target
    const value = target instanceof HTMLInputElement && target.type === 'checkbox' ? target.checked : target.value
    setForm((prev) => ({ ...prev, [target.name]: value }))
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setSubmitting(true)
    try {
      await api.post('/api/counselor/visitations', {
        residentId: Number(form.residentId),
        visitDate: form.visitDate,
        visitType: form.visitType,
        locationVisited: form.locationVisited || null,
        familyMembersPresent: form.familyMembersPresent || null,
        purpose: form.purpose || null,
        observations: form.observations || null,
        familyCooperationLevel: form.familyCooperationLevel || null,
        safetyConcernsNoted: form.safetyConcernsNoted,
        followUpNeeded: form.followUpNeeded,
        followUpNotes: form.followUpNotes || null,
        visitOutcome: form.visitOutcome || null,
      })
      setForm(EMPTY_FORM)
      setShowForm(false)
      table.refresh()
    } catch {
      // ignore
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <div className="mx-auto max-w-7xl px-4 py-12">
      <div className="mb-6 flex items-center justify-between">
        <h1 className="text-2xl font-bold">Family Visitations</h1>
        <Button onClick={() => setShowForm((v) => !v)}>
          {showForm ? 'Cancel' : 'New Visitation'}
        </Button>
      </div>

      <div className="mb-4 flex flex-wrap gap-3">
        <Select value={filterType} onValueChange={(v) => setFilterType(v ?? '')}>
          <SelectTrigger>
            <SelectValue placeholder="All visit types" />
          </SelectTrigger>
          <SelectContent>
            <SelectGroup>
              <SelectItem value="">All visit types</SelectItem>
              <SelectItem value="Initial Assessment">Initial Assessment</SelectItem>
              <SelectItem value="Routine Follow-Up">Routine Follow-Up</SelectItem>
              <SelectItem value="Reintegration Assessment">Reintegration Assessment</SelectItem>
              <SelectItem value="Post-Placement Monitoring">Post-Placement Monitoring</SelectItem>
              <SelectItem value="Emergency">Emergency</SelectItem>
            </SelectGroup>
          </SelectContent>
        </Select>
        <Input type="date" value={filterDateFrom} onChange={(e) => setFilterDateFrom(e.target.value)} className="w-40" />
        <Input type="date" value={filterDateTo} onChange={(e) => setFilterDateTo(e.target.value)} className="w-40" />
      </div>

      {showForm && (
        <form onSubmit={handleSubmit} className="bg-card border-border mb-6 rounded-lg border p-6">
          <h2 className="mb-4 text-lg font-semibold">New Visitation</h2>
          <div className="grid grid-cols-2 gap-4">
            <label className="block">
              <span className="text-sm font-medium">Resident ID</span>
              <input name="residentId" type="number" required value={form.residentId} onChange={handleChange} className="border-input bg-background mt-1 block w-full rounded-md border px-3 py-2 text-sm" />
            </label>
            <label className="block">
              <span className="text-sm font-medium">Visit Date</span>
              <input name="visitDate" type="date" required value={form.visitDate} onChange={handleChange} className="border-input bg-background mt-1 block w-full rounded-md border px-3 py-2 text-sm" />
            </label>
            <label className="block">
              <span className="text-sm font-medium">Visit Type</span>
              <select name="visitType" required value={form.visitType} onChange={handleChange} className="border-input bg-background mt-1 block w-full rounded-md border px-3 py-2 text-sm">
                <option value="">Select type...</option>
                <option value="Initial Assessment">Initial Assessment</option>
                <option value="Routine Follow-Up">Routine Follow-Up</option>
                <option value="Reintegration Assessment">Reintegration Assessment</option>
                <option value="Post-Placement Monitoring">Post-Placement Monitoring</option>
                <option value="Emergency">Emergency</option>
              </select>
            </label>
            <label className="block">
              <span className="text-sm font-medium">Location</span>
              <input name="locationVisited" type="text" value={form.locationVisited} onChange={handleChange} className="border-input bg-background mt-1 block w-full rounded-md border px-3 py-2 text-sm" />
            </label>
            <label className="block">
              <span className="text-sm font-medium">Family Members Present</span>
              <input name="familyMembersPresent" type="text" value={form.familyMembersPresent} onChange={handleChange} className="border-input bg-background mt-1 block w-full rounded-md border px-3 py-2 text-sm" />
            </label>
            <label className="block">
              <span className="text-sm font-medium">Purpose</span>
              <input name="purpose" type="text" value={form.purpose} onChange={handleChange} className="border-input bg-background mt-1 block w-full rounded-md border px-3 py-2 text-sm" />
            </label>
            <label className="block">
              <span className="text-sm font-medium">Cooperation Level</span>
              <input name="familyCooperationLevel" type="text" value={form.familyCooperationLevel} onChange={handleChange} className="border-input bg-background mt-1 block w-full rounded-md border px-3 py-2 text-sm" />
            </label>
            <label className="block">
              <span className="text-sm font-medium">Visit Outcome</span>
              <input name="visitOutcome" type="text" value={form.visitOutcome} onChange={handleChange} className="border-input bg-background mt-1 block w-full rounded-md border px-3 py-2 text-sm" />
            </label>
            <label className="col-span-2 block">
              <span className="text-sm font-medium">Observations</span>
              <textarea name="observations" rows={3} value={form.observations} onChange={handleChange} className="border-input bg-background mt-1 block w-full rounded-md border px-3 py-2 text-sm" />
            </label>
            <label className="flex items-center gap-2">
              <input name="safetyConcernsNoted" type="checkbox" checked={form.safetyConcernsNoted} onChange={handleChange} />
              <span className="text-sm">Safety Concerns Noted</span>
            </label>
            <label className="flex items-center gap-2">
              <input name="followUpNeeded" type="checkbox" checked={form.followUpNeeded} onChange={handleChange} />
              <span className="text-sm">Follow-Up Needed</span>
            </label>
            {form.followUpNeeded && (
              <label className="col-span-2 block">
                <span className="text-sm font-medium">Follow-Up Notes</span>
                <textarea name="followUpNotes" rows={2} value={form.followUpNotes} onChange={handleChange} className="border-input bg-background mt-1 block w-full rounded-md border px-3 py-2 text-sm" />
              </label>
            )}
          </div>
          <div className="mt-4">
            <Button type="submit" disabled={submitting}>
              {submitting ? 'Saving...' : 'Save Visitation'}
            </Button>
          </div>
        </form>
      )}

      <DataTable
        columns={columns}
        data={table.items}
        rowKey={(row) => row.familyVisitationTrackingId}
        sort={table.sort}
        onSort={table.setSort}
        page={table.page}
        totalPages={table.totalPages}
        totalCount={table.totalCount}
        onPageChange={table.setPage}
        loading={table.loading}
        onDelete={async (row) => {
          await counselorApi.deleteVisitation(row.familyVisitationTrackingId)
          table.refresh()
        }}
        deleteEntityLabel="visitation"
        getDeleteName={(row) => `${row.visitType} on ${row.visitDate}`}
        rowClassName={(row) => (row.safetyConcernsNoted ? 'bg-destructive/5' : undefined)}
      />
    </div>
  )
}
