import { useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import { api } from '@/api/client'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Select, SelectContent, SelectGroup, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { DataTable, type ColumnDef } from '@/components/DataTable'
import { useServerTable } from '@/hooks/useServerTable'
import { counselorApi } from '@/api/counselorApi'

interface Session {
  recordingId: number
  processRecordingId: number
  residentId: number
  sessionDate: string
  sessionType: string
  sessionDurationMinutes: number
  emotionalStateObserved: string | null
  emotionalStateEnd: string | null
  concernsFlagged: boolean
}

const EMPTY_FORM = {
  residentId: '',
  sessionDate: '',
  sessionType: '',
  sessionDurationMinutes: '',
  emotionalStateObserved: '',
  emotionalStateEnd: '',
  sessionNarrative: '',
  interventionsApplied: '',
  followUpActions: '',
  progressNoted: false,
  concernsFlagged: false,
  referralMade: false,
}

const columns: ColumnDef<Session>[] = [
  {
    key: 'sessionDate',
    header: 'Date',
    sortable: true,
    render: (row) => (
      <Link to={`/counselor/sessions/${row.recordingId ?? row.processRecordingId}`} className="text-primary underline">
        {row.sessionDate}
      </Link>
    ),
  },
  { key: 'residentId', header: 'Resident ID', sortable: true },
  { key: 'sessionType', header: 'Type', sortable: true },
  {
    key: 'sessionDurationMinutes',
    header: 'Duration',
    sortable: true,
    render: (row) => `${row.sessionDurationMinutes} min`,
  },
  { key: 'emotionalStateObserved', header: 'Emotional Start', render: (row) => row.emotionalStateObserved ?? '-' },
  { key: 'emotionalStateEnd', header: 'Emotional End', render: (row) => row.emotionalStateEnd ?? '-' },
  {
    key: 'concernsFlagged',
    header: 'Concerns',
    render: (row) => (row.concernsFlagged ? 'Yes' : 'No'),
  },
]

export function SessionsPage() {
  const [showForm, setShowForm] = useState(false)
  const [form, setForm] = useState(EMPTY_FORM)
  const [submitting, setSubmitting] = useState(false)
  const [filterType, setFilterType] = useState('')
  const [filterDateFrom, setFilterDateFrom] = useState('')
  const [filterDateTo, setFilterDateTo] = useState('')
  const [filterConcernsOnly, setFilterConcernsOnly] = useState(false)

  const filters = useMemo(
    () => ({
      sessionType: filterType,
      dateFrom: filterDateFrom,
      dateTo: filterDateTo,
      concernsOnly: filterConcernsOnly ? 'true' : '',
    }),
    [filterType, filterDateFrom, filterDateTo, filterConcernsOnly],
  )

  const table = useServerTable<Session>({
    endpoint: '/api/counselor/sessions',
    pageSize: 20,
    defaultSort: 'sessionDate',
    defaultDirection: 'desc',
    filters,
  })

  function handleChange(e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) {
    const target = e.target
    const value = target instanceof HTMLInputElement && target.type === 'checkbox' ? target.checked : target.value
    setForm((prev) => ({ ...prev, [target.name]: value }))
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setSubmitting(true)
    try {
      await api.post('/api/counselor/sessions', {
        residentId: Number(form.residentId),
        sessionDate: form.sessionDate,
        sessionType: form.sessionType,
        sessionDurationMinutes: Number(form.sessionDurationMinutes),
        emotionalStateObserved: form.emotionalStateObserved || null,
        emotionalStateEnd: form.emotionalStateEnd || null,
        sessionNarrative: form.sessionNarrative || null,
        interventionsApplied: form.interventionsApplied || null,
        followUpActions: form.followUpActions || null,
        progressNoted: form.progressNoted,
        concernsFlagged: form.concernsFlagged,
        referralMade: form.referralMade,
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
        <h1 className="text-2xl font-bold">Counseling Sessions</h1>
        <Button onClick={() => setShowForm((v) => !v)}>
          {showForm ? 'Cancel' : 'New Session'}
        </Button>
      </div>

      <div className="mb-4 flex flex-wrap gap-3">
        <Select value={filterType} onValueChange={(v) => setFilterType(v ?? '')}>
          <SelectTrigger>
            <SelectValue placeholder="All types" />
          </SelectTrigger>
          <SelectContent>
            <SelectGroup>
              <SelectItem value="">All types</SelectItem>
              <SelectItem value="Individual">Individual</SelectItem>
              <SelectItem value="Group">Group</SelectItem>
            </SelectGroup>
          </SelectContent>
        </Select>
        <Input type="date" value={filterDateFrom} onChange={(e) => setFilterDateFrom(e.target.value)} className="w-40" />
        <Input type="date" value={filterDateTo} onChange={(e) => setFilterDateTo(e.target.value)} className="w-40" />
        <label className="flex items-center gap-2">
          <input type="checkbox" checked={filterConcernsOnly} onChange={(e) => setFilterConcernsOnly(e.target.checked)} />
          <span className="text-sm">Concerns only</span>
        </label>
      </div>

      {showForm && (
        <form onSubmit={handleSubmit} className="bg-card border-border mb-6 rounded-lg border p-6">
          <h2 className="mb-4 text-lg font-semibold">New Session</h2>
          <div className="grid grid-cols-2 gap-4">
            <label className="block">
              <span className="text-sm font-medium">Resident ID</span>
              <input name="residentId" type="number" required value={form.residentId} onChange={handleChange} className="border-input bg-background mt-1 block w-full rounded-md border px-3 py-2 text-sm" />
            </label>
            <label className="block">
              <span className="text-sm font-medium">Session Date</span>
              <input name="sessionDate" type="date" required value={form.sessionDate} onChange={handleChange} className="border-input bg-background mt-1 block w-full rounded-md border px-3 py-2 text-sm" />
            </label>
            <label className="block">
              <span className="text-sm font-medium">Session Type</span>
              <input name="sessionType" type="text" required value={form.sessionType} onChange={handleChange} className="border-input bg-background mt-1 block w-full rounded-md border px-3 py-2 text-sm" />
            </label>
            <label className="block">
              <span className="text-sm font-medium">Duration (minutes)</span>
              <input name="sessionDurationMinutes" type="number" required value={form.sessionDurationMinutes} onChange={handleChange} className="border-input bg-background mt-1 block w-full rounded-md border px-3 py-2 text-sm" />
            </label>
            <label className="block">
              <span className="text-sm font-medium">Emotional State (start)</span>
              <input name="emotionalStateObserved" type="text" value={form.emotionalStateObserved} onChange={handleChange} className="border-input bg-background mt-1 block w-full rounded-md border px-3 py-2 text-sm" />
            </label>
            <label className="block">
              <span className="text-sm font-medium">Emotional State (end)</span>
              <input name="emotionalStateEnd" type="text" value={form.emotionalStateEnd} onChange={handleChange} className="border-input bg-background mt-1 block w-full rounded-md border px-3 py-2 text-sm" />
            </label>
            <label className="col-span-2 block">
              <span className="text-sm font-medium">Session Narrative</span>
              <textarea name="sessionNarrative" rows={3} value={form.sessionNarrative} onChange={handleChange} className="border-input bg-background mt-1 block w-full rounded-md border px-3 py-2 text-sm" />
            </label>
            <label className="col-span-2 block">
              <span className="text-sm font-medium">Interventions Applied</span>
              <textarea name="interventionsApplied" rows={2} value={form.interventionsApplied} onChange={handleChange} className="border-input bg-background mt-1 block w-full rounded-md border px-3 py-2 text-sm" />
            </label>
            <label className="col-span-2 block">
              <span className="text-sm font-medium">Follow-Up Actions</span>
              <textarea name="followUpActions" rows={2} value={form.followUpActions} onChange={handleChange} className="border-input bg-background mt-1 block w-full rounded-md border px-3 py-2 text-sm" />
            </label>
            <label className="flex items-center gap-2">
              <input name="progressNoted" type="checkbox" checked={form.progressNoted} onChange={handleChange} />
              <span className="text-sm">Progress Noted</span>
            </label>
            <label className="flex items-center gap-2">
              <input name="concernsFlagged" type="checkbox" checked={form.concernsFlagged} onChange={handleChange} />
              <span className="text-sm">Concerns Flagged</span>
            </label>
            <label className="flex items-center gap-2">
              <input name="referralMade" type="checkbox" checked={form.referralMade} onChange={handleChange} />
              <span className="text-sm">Referral Made</span>
            </label>
          </div>
          <div className="mt-4">
            <Button type="submit" disabled={submitting}>
              {submitting ? 'Saving...' : 'Save Session'}
            </Button>
          </div>
        </form>
      )}

      <DataTable
        columns={columns}
        data={table.items}
        rowKey={(row) => row.recordingId ?? row.processRecordingId}
        sort={table.sort}
        onSort={table.setSort}
        page={table.page}
        totalPages={table.totalPages}
        totalCount={table.totalCount}
        onPageChange={table.setPage}
        loading={table.loading}
        onDelete={async (row) => {
          await counselorApi.deleteSession(row.recordingId ?? row.processRecordingId)
          table.refresh()
        }}
        deleteEntityLabel="session"
        getDeleteName={(row) => `Session on ${row.sessionDate} (${row.sessionType})`}
      />
    </div>
  )
}
