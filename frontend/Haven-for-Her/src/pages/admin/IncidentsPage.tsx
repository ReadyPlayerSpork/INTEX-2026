import { useMemo, useState } from 'react'
import { api } from '@/api/client'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Select, SelectContent, SelectGroup, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { DataTable, type ColumnDef } from '@/components/DataTable'
import { useServerTable } from '@/hooks/useServerTable'

interface Incident {
  incidentId: number
  residentId: number
  residentCode: string | null
  safehouseId: number
  safehouseName: string | null
  incidentDate: string
  incidentType: string
  severity: string
  resolved: boolean
  reportedBy: string
  description: string
  responseTaken: string
}

const EMPTY_FORM = {
  residentId: '',
  safehouseId: '',
  incidentDate: '',
  incidentType: '',
  severity: '',
  description: '',
  responseTaken: '',
  reportedBy: '',
  resolved: false,
}

const columns: ColumnDef<Incident>[] = [
  { key: 'incidentDate', header: 'Date', sortable: true },
  {
    key: 'residentCode',
    header: 'Resident',
    render: (row) => row.residentCode ?? String(row.residentId),
  },
  {
    key: 'safehouseName',
    header: 'Safehouse',
    sortable: true,
    render: (row) => row.safehouseName ?? '-',
  },
  { key: 'incidentType', header: 'Type', sortable: true },
  { key: 'severity', header: 'Severity', sortable: true },
  {
    key: 'resolved',
    header: 'Resolved',
    render: (row) => (row.resolved ? 'Yes' : 'No'),
  },
  { key: 'reportedBy', header: 'Reported By', sortable: true },
]

export function IncidentsPage() {
  const [safehouseFilter, setSafehouseFilter] = useState('')
  const [severityFilter, setSeverityFilter] = useState('')
  const [resolvedFilter, setResolvedFilter] = useState('')
  const [showForm, setShowForm] = useState(false)
  const [form, setForm] = useState(EMPTY_FORM)
  const [editId, setEditId] = useState<number | null>(null)
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState('')

  const filters = useMemo(
    () => ({
      safehouseId: safehouseFilter,
      severity: severityFilter,
      resolved: resolvedFilter,
    }),
    [safehouseFilter, severityFilter, resolvedFilter],
  )

  const table = useServerTable<Incident>({
    endpoint: '/api/incidents',
    pageSize: 20,
    defaultSort: 'incidentDate',
    defaultDirection: 'desc',
    filters,
  })

  function handleChange(e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) {
    const target = e.target
    const value = target instanceof HTMLInputElement && target.type === 'checkbox' ? (target as HTMLInputElement).checked : target.value
    setForm((prev) => ({ ...prev, [target.name]: value }))
  }

  function startEdit(incident: Incident) {
    setEditId(incident.incidentId)
    setForm({
      residentId: String(incident.residentId),
      safehouseId: String(incident.safehouseId),
      incidentDate: incident.incidentDate.split('T')[0],
      incidentType: incident.incidentType,
      severity: incident.severity,
      description: incident.description ?? '',
      responseTaken: incident.responseTaken ?? '',
      reportedBy: incident.reportedBy ?? '',
      resolved: incident.resolved,
    })
    setShowForm(true)
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setSubmitting(true)
    setError('')
    try {
      const body = {
        residentId: Number(form.residentId),
        safehouseId: Number(form.safehouseId),
        incidentDate: form.incidentDate,
        incidentType: form.incidentType,
        severity: form.severity,
        description: form.description || '',
        responseTaken: form.responseTaken || '',
        reportedBy: form.reportedBy || '',
        resolved: form.resolved,
        followUpRequired: false,
      }
      if (editId) {
        await api.put(`/api/incidents/${editId}`, body)
      } else {
        await api.post('/api/incidents', body)
      }
      setForm(EMPTY_FORM)
      setEditId(null)
      setShowForm(false)
      table.refresh()
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to save incident.')
    } finally {
      setSubmitting(false)
    }
  }

  function cancelForm() {
    setForm(EMPTY_FORM)
    setEditId(null)
    setShowForm(false)
  }

  return (
    <div className="mx-auto max-w-7xl px-4 py-12">
      <div className="mb-6 flex items-center justify-between">
        <h1 className="text-2xl font-bold">Incident Reports</h1>
        <Button onClick={() => (showForm ? cancelForm() : setShowForm(true))}>
          {showForm ? 'Cancel' : 'New Incident'}
        </Button>
      </div>

      {showForm && (
        <form onSubmit={handleSubmit} className="bg-card border-border mb-6 rounded-lg border p-6">
          <h2 className="mb-4 text-lg font-semibold">{editId ? 'Edit Incident' : 'New Incident'}</h2>
          <div className="grid grid-cols-2 gap-4">
            <label className="block">
              <span className="text-sm font-medium">Resident ID</span>
              <input name="residentId" type="number" required value={form.residentId} onChange={handleChange} className="border-input bg-background mt-1 block w-full rounded-md border px-3 py-2 text-sm" />
            </label>
            <label className="block">
              <span className="text-sm font-medium">Safehouse ID</span>
              <input name="safehouseId" type="number" required value={form.safehouseId} onChange={handleChange} className="border-input bg-background mt-1 block w-full rounded-md border px-3 py-2 text-sm" />
            </label>
            <label className="block">
              <span className="text-sm font-medium">Incident Date</span>
              <input name="incidentDate" type="date" required value={form.incidentDate} onChange={handleChange} className="border-input bg-background mt-1 block w-full rounded-md border px-3 py-2 text-sm" />
            </label>
            <label className="block">
              <span className="text-sm font-medium">Incident Type</span>
              <input name="incidentType" type="text" required value={form.incidentType} onChange={handleChange} className="border-input bg-background mt-1 block w-full rounded-md border px-3 py-2 text-sm" />
            </label>
            <label className="block">
              <span className="text-sm font-medium">Severity</span>
              <select name="severity" required value={form.severity} onChange={handleChange} className="border-input bg-background mt-1 block w-full rounded-md border px-3 py-2 text-sm">
                <option value="">Select...</option>
                <option value="Low">Low</option>
                <option value="Medium">Medium</option>
                <option value="High">High</option>
                <option value="Critical">Critical</option>
              </select>
            </label>
            <label className="block">
              <span className="text-sm font-medium">Reported By</span>
              <input name="reportedBy" type="text" required value={form.reportedBy} onChange={handleChange} className="border-input bg-background mt-1 block w-full rounded-md border px-3 py-2 text-sm" />
            </label>
            <label className="col-span-2 flex items-center gap-2">
              <input name="resolved" type="checkbox" checked={form.resolved} onChange={handleChange} />
              <span className="text-sm">Resolved</span>
            </label>
            <label className="col-span-2 block">
              <span className="text-sm font-medium">Description</span>
              <textarea name="description" required rows={3} value={form.description} onChange={handleChange} className="border-input bg-background mt-1 block w-full rounded-md border px-3 py-2 text-sm" />
            </label>
            <label className="col-span-2 block">
              <span className="text-sm font-medium">Response Taken</span>
              <textarea name="responseTaken" required rows={2} value={form.responseTaken} onChange={handleChange} className="border-input bg-background mt-1 block w-full rounded-md border px-3 py-2 text-sm" />
            </label>
          </div>
          {error && <p className="text-destructive mt-2 text-sm">{error}</p>}
          <div className="mt-4">
            <Button type="submit" disabled={submitting}>
              {submitting ? 'Saving...' : editId ? 'Update Incident' : 'Save Incident'}
            </Button>
          </div>
        </form>
      )}

      <div className="mb-4 flex flex-wrap gap-3">
        <Input
          type="text"
          placeholder="Filter by safehouse ID..."
          value={safehouseFilter}
          onChange={(e) => setSafehouseFilter(e.target.value)}
          className="w-48"
        />
        <Select value={severityFilter} onValueChange={(v) => setSeverityFilter(v ?? '')}>
          <SelectTrigger>
            <SelectValue placeholder="All severities" />
          </SelectTrigger>
          <SelectContent>
            <SelectGroup>
              <SelectItem value="">All severities</SelectItem>
              <SelectItem value="Low">Low</SelectItem>
              <SelectItem value="Medium">Medium</SelectItem>
              <SelectItem value="High">High</SelectItem>
              <SelectItem value="Critical">Critical</SelectItem>
            </SelectGroup>
          </SelectContent>
        </Select>
        <Select value={resolvedFilter} onValueChange={(v) => setResolvedFilter(v ?? '')}>
          <SelectTrigger>
            <SelectValue placeholder="All" />
          </SelectTrigger>
          <SelectContent>
            <SelectGroup>
              <SelectItem value="">All</SelectItem>
              <SelectItem value="true">Resolved</SelectItem>
              <SelectItem value="false">Unresolved</SelectItem>
            </SelectGroup>
          </SelectContent>
        </Select>
      </div>

      <DataTable
        columns={columns}
        data={table.items}
        rowKey={(row) => row.incidentId}
        sort={table.sort}
        onSort={table.setSort}
        page={table.page}
        totalPages={table.totalPages}
        totalCount={table.totalCount}
        onPageChange={table.setPage}
        loading={table.loading}
        onEdit={(row) => startEdit(row)}
        onDelete={async (row) => {
          await api.delete(`/api/incidents/${row.incidentId}`)
          table.refresh()
        }}
        deleteEntityLabel="incident report"
        getDeleteName={(row) => `Incident on ${row.incidentDate} (${row.incidentType})`}
      />
    </div>
  )
}
