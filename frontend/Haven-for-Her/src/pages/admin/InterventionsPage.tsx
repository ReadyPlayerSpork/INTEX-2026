import { useMemo, useState } from 'react'
import { api } from '@/api/client'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Select, SelectContent, SelectGroup, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { DataTable, type ColumnDef } from '@/components/DataTable'
import { useServerTable } from '@/hooks/useServerTable'

interface Intervention {
  planId: number
  residentId: number
  residentCode: string | null
  planCategory: string
  planDescription: string | null
  servicesProvided: string | null
  targetDate: string | null
  status: string
}

const EMPTY_FORM = {
  residentId: '',
  planCategory: '',
  planDescription: '',
  servicesProvided: '',
  targetDate: '',
  status: '',
}

const columns: ColumnDef<Intervention>[] = [
  {
    key: 'residentCode',
    header: 'Resident',
    sortable: true,
    render: (row) => row.residentCode ?? String(row.residentId),
  },
  { key: 'planCategory', header: 'Category', sortable: true },
  {
    key: 'planDescription',
    header: 'Description',
    className: 'max-w-xs truncate',
    render: (row) => row.planDescription ?? '-',
  },
  {
    key: 'servicesProvided',
    header: 'Services',
    className: 'max-w-xs truncate',
    render: (row) => row.servicesProvided ?? '-',
  },
  { key: 'targetDate', header: 'Target Date', sortable: true, render: (row) => row.targetDate ?? '-' },
  { key: 'status', header: 'Status', sortable: true },
]

export function InterventionsPage() {
  const [categoryFilter, setCategoryFilter] = useState('')
  const [statusFilter, setStatusFilter] = useState('')
  const [showForm, setShowForm] = useState(false)
  const [form, setForm] = useState(EMPTY_FORM)
  const [editId, setEditId] = useState<number | null>(null)
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState('')

  const filters = useMemo(
    () => ({ category: categoryFilter, status: statusFilter }),
    [categoryFilter, statusFilter],
  )

  const table = useServerTable<Intervention>({
    endpoint: '/api/interventions',
    pageSize: 20,
    filters,
  })

  function handleChange(e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) {
    setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }))
  }

  function startEdit(item: Intervention) {
    setEditId(item.planId)
    setForm({
      residentId: String(item.residentId),
      planCategory: item.planCategory,
      planDescription: item.planDescription ?? '',
      servicesProvided: item.servicesProvided ?? '',
      targetDate: item.targetDate?.split('T')[0] ?? '',
      status: item.status,
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
        planCategory: form.planCategory,
        planDescription: form.planDescription || '',
        servicesProvided: form.servicesProvided || '',
        targetDate: form.targetDate || new Date().toISOString().split('T')[0],
        status: form.status,
      }
      if (editId) {
        await api.put(`/api/interventions/${editId}`, body)
      } else {
        await api.post('/api/interventions', body)
      }
      setForm(EMPTY_FORM)
      setEditId(null)
      setShowForm(false)
      table.refresh()
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to save intervention.')
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
        <h1 className="text-2xl font-bold">Intervention Plans</h1>
        <Button onClick={() => (showForm ? cancelForm() : setShowForm(true))}>
          {showForm ? 'Cancel' : 'New Plan'}
        </Button>
      </div>

      {showForm && (
        <form onSubmit={handleSubmit} className="bg-card border-border mb-6 rounded-lg border p-6">
          <h2 className="mb-4 text-lg font-semibold">{editId ? 'Edit Plan' : 'New Intervention Plan'}</h2>
          <div className="grid grid-cols-2 gap-4">
            <label className="block">
              <span className="text-sm font-medium">Resident ID</span>
              <input name="residentId" type="number" required value={form.residentId} onChange={handleChange} className="border-input bg-background mt-1 block w-full rounded-md border px-3 py-2 text-sm" />
            </label>
            <label className="block">
              <span className="text-sm font-medium">Category</span>
              <input name="planCategory" type="text" required value={form.planCategory} onChange={handleChange} className="border-input bg-background mt-1 block w-full rounded-md border px-3 py-2 text-sm" />
            </label>
            <label className="block">
              <span className="text-sm font-medium">Target Date</span>
              <input name="targetDate" type="date" required value={form.targetDate} onChange={handleChange} className="border-input bg-background mt-1 block w-full rounded-md border px-3 py-2 text-sm" />
            </label>
            <label className="block">
              <span className="text-sm font-medium">Status</span>
              <select name="status" required value={form.status} onChange={handleChange} className="border-input bg-background mt-1 block w-full rounded-md border px-3 py-2 text-sm">
                <option value="">Select...</option>
                <option value="Open">Open</option>
                <option value="In Progress">In Progress</option>
                <option value="On Hold">On Hold</option>
                <option value="Achieved">Achieved</option>
                <option value="Closed">Closed</option>
              </select>
            </label>
            <label className="col-span-2 block">
              <span className="text-sm font-medium">Description</span>
              <textarea name="planDescription" required rows={2} value={form.planDescription} onChange={handleChange} className="border-input bg-background mt-1 block w-full rounded-md border px-3 py-2 text-sm" />
            </label>
            <label className="col-span-2 block">
              <span className="text-sm font-medium">Services Provided</span>
              <textarea name="servicesProvided" required rows={2} value={form.servicesProvided} onChange={handleChange} className="border-input bg-background mt-1 block w-full rounded-md border px-3 py-2 text-sm" />
            </label>
          </div>
          {error && <p className="text-destructive mt-2 text-sm">{error}</p>}
          <div className="mt-4">
            <Button type="submit" disabled={submitting}>
              {submitting ? 'Saving...' : editId ? 'Update Plan' : 'Save Plan'}
            </Button>
          </div>
        </form>
      )}

      <div className="mb-4 flex flex-wrap gap-3">
        <Input
          type="text"
          placeholder="Filter by category..."
          value={categoryFilter}
          onChange={(e) => setCategoryFilter(e.target.value)}
          className="w-48"
        />
        <Select value={statusFilter} onValueChange={(v) => setStatusFilter(v ?? '')}>
          <SelectTrigger>
            <SelectValue placeholder="All statuses" />
          </SelectTrigger>
          <SelectContent>
            <SelectGroup>
              <SelectItem value="">All statuses</SelectItem>
              <SelectItem value="Open">Open</SelectItem>
              <SelectItem value="In Progress">In Progress</SelectItem>
              <SelectItem value="On Hold">On Hold</SelectItem>
              <SelectItem value="Achieved">Achieved</SelectItem>
              <SelectItem value="Closed">Closed</SelectItem>
            </SelectGroup>
          </SelectContent>
        </Select>
      </div>

      <DataTable
        columns={columns}
        data={table.items}
        rowKey={(row) => row.planId}
        sort={table.sort}
        onSort={table.setSort}
        page={table.page}
        totalPages={table.totalPages}
        totalCount={table.totalCount}
        onPageChange={table.setPage}
        loading={table.loading}
        onEdit={(row) => startEdit(row)}
        onDelete={async (row) => {
          await api.delete(`/api/interventions/${row.planId}`)
          table.refresh()
        }}
        deleteEntityLabel="intervention plan"
        getDeleteName={(row) => `${row.planCategory} for ${row.residentCode ?? row.residentId}`}
      />
    </div>
  )
}
