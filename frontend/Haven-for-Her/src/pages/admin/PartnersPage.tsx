import { useMemo, useState } from 'react'
import { api } from '@/api/client'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Select, SelectContent, SelectGroup, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { DataTable, type ColumnDef, type CascadeInfo } from '@/components/DataTable'
import { useServerTable } from '@/hooks/useServerTable'

/* ---------- Types ---------- */

interface Partner {
  partnerId: number
  partnerName: string
  partnerType: string
  roleType: string
  contactName: string
  email: string
  phone: string
  region: string
  status: string
  startDate: string
  endDate?: string
  notes?: string
  assignmentCount: number
}

interface PartnerForm {
  partnerName: string
  partnerType: string
  roleType: string
  contactName: string
  email: string
  phone: string
  region: string
  status: string
  startDate: string
  endDate: string
  notes: string
}

interface Assignment {
  assignmentId: number
  safehouseId: number
  safehouseName: string | null
  programArea: string
  assignmentStart: string
  assignmentEnd: string | null
  responsibilityNotes: string | null
  isPrimary: boolean
  status: string
}

const EMPTY_FORM: PartnerForm = {
  partnerName: '',
  partnerType: '',
  roleType: '',
  contactName: '',
  email: '',
  phone: '',
  region: '',
  status: 'Active',
  startDate: '',
  endDate: '',
  notes: '',
}

const columns: ColumnDef<Partner>[] = [
  {
    key: 'partnerName',
    header: 'Name',
    sortable: true,
  },
  { key: 'partnerType', header: 'Type', sortable: true },
  { key: 'roleType', header: 'Role', sortable: true },
  { key: 'contactName', header: 'Contact', sortable: true },
  { key: 'email', header: 'Email', sortable: true },
  { key: 'region', header: 'Region', sortable: true },
  { key: 'status', header: 'Status', sortable: true },
  { key: 'assignmentCount', header: 'Assignments' },
]

/* ---------- Page ---------- */

export function PartnersPage() {
  const [filterRegion, setFilterRegion] = useState('')
  const [filterStatus, setFilterStatus] = useState('')
  const [showForm, setShowForm] = useState(false)
  const [editingId, setEditingId] = useState<number | null>(null)
  const [form, setForm] = useState<PartnerForm>(EMPTY_FORM)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')

  /* detail view */
  const [selectedPartner, setSelectedPartner] = useState<Partner | null>(null)
  const [assignments, setAssignments] = useState<Assignment[]>([])
  const [loadingAssignments, setLoadingAssignments] = useState(false)

  const filters = useMemo(
    () => ({ region: filterRegion, status: filterStatus }),
    [filterRegion, filterStatus],
  )

  const table = useServerTable<Partner>({
    endpoint: '/api/admin/partners',
    pageSize: 20,
    defaultSort: 'partnerName',
    defaultDirection: 'asc',
    filters,
  })

  function openEdit(p: Partner) {
    setEditingId(p.partnerId)
    setForm({
      partnerName: p.partnerName,
      partnerType: p.partnerType,
      roleType: p.roleType,
      contactName: p.contactName,
      email: p.email,
      phone: p.phone ?? '',
      region: p.region,
      status: p.status,
      startDate: p.startDate?.split('T')[0] ?? '',
      endDate: p.endDate?.split('T')[0] ?? '',
      notes: p.notes ?? '',
    })
    setShowForm(true)
    setSelectedPartner(null)
  }

  function cancelForm() {
    setForm(EMPTY_FORM)
    setEditingId(null)
    setShowForm(false)
  }

  async function handleSave(e: React.FormEvent) {
    e.preventDefault()
    setSaving(true)
    setError('')
    try {
      if (editingId) {
        await api.put(`/api/admin/partners/${editingId}`, form)
      } else {
        await api.post('/api/admin/partners', form)
      }
      cancelForm()
      table.refresh()
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to save partner.')
    } finally {
      setSaving(false)
    }
  }

  async function viewAssignments(p: Partner) {
    setSelectedPartner(p)
    setShowForm(false)
    setLoadingAssignments(true)
    try {
      const res = await api.get<Assignment[]>(`/api/admin/partners/${p.partnerId}/assignments`)
      setAssignments(res)
    } catch {
      setAssignments([])
    } finally {
      setLoadingAssignments(false)
    }
  }

  const updateField = (field: keyof PartnerForm, value: string) => {
    setForm((prev) => ({ ...prev, [field]: value }))
  }

  return (
    <div className="mx-auto max-w-7xl px-4 py-12">
      <div className="mb-6 flex items-center justify-between">
        <h1 className="text-2xl font-bold">Partners</h1>
        <Button onClick={() => (showForm ? cancelForm() : (setShowForm(true), setSelectedPartner(null)))}>
          {showForm ? 'Cancel' : 'New Partner'}
        </Button>
      </div>

      {error && <p className="text-destructive mb-4 text-sm">{error}</p>}

      {showForm && (
        <form onSubmit={handleSave} className="bg-card border-border mb-6 rounded-lg border p-6">
          <h2 className="mb-4 text-lg font-semibold">{editingId ? 'Edit Partner' : 'New Partner'}</h2>
          <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
            <Input placeholder="Partner Name" required value={form.partnerName} onChange={(e) => updateField('partnerName', e.target.value)} />
            <Input placeholder="Partner Type" required value={form.partnerType} onChange={(e) => updateField('partnerType', e.target.value)} />
            <Input placeholder="Role Type" required value={form.roleType} onChange={(e) => updateField('roleType', e.target.value)} />
            <Input placeholder="Contact Name" required value={form.contactName} onChange={(e) => updateField('contactName', e.target.value)} />
            <Input placeholder="Email" type="email" required value={form.email} onChange={(e) => updateField('email', e.target.value)} />
            <Input placeholder="Phone" value={form.phone} onChange={(e) => updateField('phone', e.target.value)} />
            <Input placeholder="Region" required value={form.region} onChange={(e) => updateField('region', e.target.value)} />
            <select
              required
              value={form.status}
              onChange={(e) => updateField('status', e.target.value)}
              className="border-input bg-background mt-1 block w-full rounded-md border px-3 py-2 text-sm"
            >
              <option value="Active">Active</option>
              <option value="Inactive">Inactive</option>
              <option value="Suspended">Suspended</option>
            </select>
            <Input type="date" placeholder="Start Date" required value={form.startDate} onChange={(e) => updateField('startDate', e.target.value)} />
            <Input type="date" placeholder="End Date" value={form.endDate || ''} onChange={(e) => updateField('endDate', e.target.value)} />
            <Input className="col-span-2" placeholder="Notes" value={form.notes || ''} onChange={(e) => updateField('notes', e.target.value)} />
          </div>
          <div className="mt-4">
            <Button type="submit" disabled={saving}>
              {saving ? 'Saving...' : editingId ? 'Update Partner' : 'Save Partner'}
            </Button>
          </div>
        </form>
      )}

      {/* Assignments detail panel */}
      {selectedPartner && (
        <div className="bg-card border-border mb-6 rounded-lg border p-6">
          <div className="mb-3 flex items-center justify-between">
            <h2 className="text-lg font-semibold">Assignments for {selectedPartner.partnerName}</h2>
            <Button variant="outline" size="sm" onClick={() => setSelectedPartner(null)}>Close</Button>
          </div>
          {loadingAssignments ? (
            <p className="text-muted-foreground animate-pulse">Loading assignments...</p>
          ) : assignments.length === 0 ? (
            <p className="text-muted-foreground text-sm">No assignments found.</p>
          ) : (
            <table className="w-full text-sm">
              <thead>
                <tr className="border-border border-b text-left">
                  <th className="px-3 py-2 font-medium">ID</th>
                  <th className="px-3 py-2 font-medium">Safehouse</th>
                  <th className="px-3 py-2 font-medium">Program Area</th>
                  <th className="px-3 py-2 font-medium">Status</th>
                  <th className="px-3 py-2 font-medium">Assigned Date</th>
                </tr>
              </thead>
              <tbody>
                {assignments.map((a) => (
                  <tr key={a.assignmentId} className="border-border border-b">
                    <td className="px-3 py-2">{a.assignmentId}</td>
                    <td className="px-3 py-2">{a.safehouseName || a.safehouseId}</td>
                    <td className="px-3 py-2">{a.programArea}</td>
                    <td className="px-3 py-2">{a.status}</td>
                    <td className="px-3 py-2">{a.assignmentStart?.split('T')[0]}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      )}

      <div className="mb-4 flex flex-wrap gap-3">
        <Input
          type="text"
          placeholder="Filter region..."
          value={filterRegion}
          onChange={(e) => setFilterRegion(e.target.value)}
          className="w-48"
        />
        <Select value={filterStatus} onValueChange={(v) => setFilterStatus(v ?? '')}>
          <SelectTrigger>
            <SelectValue placeholder="All statuses" />
          </SelectTrigger>
          <SelectContent>
            <SelectGroup>
              <SelectItem value="">All statuses</SelectItem>
              <SelectItem value="Active">Active</SelectItem>
              <SelectItem value="Inactive">Inactive</SelectItem>
              <SelectItem value="Suspended">Suspended</SelectItem>
            </SelectGroup>
          </SelectContent>
        </Select>
      </div>

      <DataTable
        columns={columns}
        data={table.items}
        rowKey={(row) => row.partnerId}
        sort={table.sort}
        onSort={table.setSort}
        page={table.page}
        totalPages={table.totalPages}
        totalCount={table.totalCount}
        onPageChange={table.setPage}
        loading={table.loading}
        onEdit={(row) => openEdit(row)}
        onDelete={async (row) => {
          await api.delete(`/api/admin/partners/${row.partnerId}`)
          table.refresh()
        }}
        getCascadeInfo={(row) => api.get<CascadeInfo[]>(`/api/admin/partners/${row.partnerId}/cascade-info`)}
        deleteEntityLabel="partner"
        getDeleteName={(row) => row.partnerName}
        rowActions={(row) => (
          <Button variant="ghost" size="sm" onClick={() => viewAssignments(row)}>
            Assignments
          </Button>
        )}
      />
    </div>
  )
}
