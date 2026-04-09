import { useEffect, useMemo, useState } from 'react'
import { Brain } from 'lucide-react'
import { api } from '@/api/client'
import { getSafehouseOutcomes, type SafehouseOutcome } from '@/api/mlApi'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Select, SelectContent, SelectGroup, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { DataTable, type ColumnDef } from '@/components/DataTable'
import { useServerTable } from '@/hooks/useServerTable'
import type { CascadeImpact } from '@/types/cascade'

interface Safehouse {
  safehouseId: number
  name: string
  safehouseCode: string
  region: string
  city: string
  province: string
  country: string
  status: string
  capacityGirls: number
  capacityStaff: number
  currentOccupancy: number
  openDate: string
  notes?: string
}

interface SafehouseForm {
  name: string
  safehouseCode: string
  region: string
  city: string
  province: string
  country: string
  status: string
  capacityGirls: number
  capacityStaff: number
  openDate: string
  notes: string
}

const EMPTY_FORM: SafehouseForm = {
  name: '',
  safehouseCode: '',
  region: '',
  city: '',
  province: '',
  country: '',
  status: 'Active',
  capacityGirls: 0,
  capacityStaff: 0,
  openDate: '',
  notes: '',
}

const columns: ColumnDef<Safehouse>[] = [
  { key: 'name', header: 'Name', sortable: true },
  { key: 'safehouseCode', header: 'Code', sortable: true },
  {
    key: 'city',
    header: 'Location',
    sortable: true,
    render: (row) => `${row.city}, ${row.province}`,
  },
  { key: 'status', header: 'Status', sortable: true },
  {
    key: 'capacityGirls',
    header: 'Capacity',
    sortable: true,
    render: (row) => `${row.capacityGirls} Girls / ${row.capacityStaff} Staff`,
  },
  { key: 'currentOccupancy', header: 'Occupancy', sortable: true },
  {
    key: 'openDate',
    header: 'Open Date',
    sortable: true,
    render: (row) => row.openDate?.split('T')[0] ?? '-',
  },
]

export function SafehousesPage() {
  const [filterRegion, setFilterRegion] = useState('')
  const [filterStatus, setFilterStatus] = useState('')
  const [showForm, setShowForm] = useState(false)
  const [editingId, setEditingId] = useState<number | null>(null)
  const [form, setForm] = useState<SafehouseForm>(EMPTY_FORM)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')
  const [mlOutcomes, setMlOutcomes] = useState<SafehouseOutcome[] | null>(null)
  const [mlOutcomesErr, setMlOutcomesErr] = useState<string | null>(null)

  useEffect(() => {
    getSafehouseOutcomes()
      .then(setMlOutcomes)
      .catch(() =>
        setMlOutcomesErr(
          'Education progress predictions are unavailable (train safehouse model or check the ML service).',
        ),
      )
  }, [])

  const filters = useMemo(
    () => ({ region: filterRegion, status: filterStatus }),
    [filterRegion, filterStatus],
  )

  const table = useServerTable<Safehouse>({
    endpoint: '/api/admin/safehouses',
    pageSize: 20,
    defaultSort: 'name',
    defaultDirection: 'asc',
    filters,
  })

  function openEdit(s: Safehouse) {
    setEditingId(s.safehouseId)
    setForm({
      name: s.name,
      safehouseCode: s.safehouseCode,
      region: s.region,
      city: s.city,
      province: s.province,
      country: s.country,
      status: s.status,
      capacityGirls: s.capacityGirls,
      capacityStaff: s.capacityStaff,
      openDate: s.openDate?.split('T')[0] ?? '',
      notes: s.notes ?? '',
    })
    setShowForm(true)
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
        await api.put(`/api/admin/safehouses/${editingId}`, form)
      } else {
        await api.post('/api/admin/safehouses', form)
      }
      cancelForm()
      table.refresh()
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to save safehouse.')
    } finally {
      setSaving(false)
    }
  }

  const updateField = (field: keyof SafehouseForm, value: string | number) => {
    setForm((prev) => ({ ...prev, [field]: value }))
  }

  return (
    <div className="mx-auto max-w-7xl px-4 py-12">
      <div className="mb-6 flex items-center justify-between">
        <h1 className="text-2xl font-bold">Safehouses</h1>
        <Button onClick={() => (showForm ? cancelForm() : setShowForm(true))}>
          {showForm ? 'Cancel' : 'New Safehouse'}
        </Button>
      </div>

      {error && <p className="text-destructive mb-4 text-sm">{error}</p>}

      {mlOutcomesErr && (
        <p className="text-muted-foreground mb-4 text-sm" role="status">
          {mlOutcomesErr}
        </p>
      )}
      {mlOutcomes && mlOutcomes.length > 0 && (
        <Card className="border-primary/25 bg-card/95 mb-8">
          <CardHeader className="pb-2">
            <CardTitle className="font-heading flex items-center gap-2 text-lg">
              <Brain className="text-primary size-5 shrink-0" aria-hidden />
              ML education outcomes
            </CardTitle>
            <CardDescription>
              Predicted vs observed average education progress per safehouse (regression model on funding and lag features).
            </CardDescription>
          </CardHeader>
          <CardContent className="pt-0">
            <div className="overflow-x-auto">
              <table className="w-full text-sm" aria-label="Safehouse ML outcomes">
                <thead>
                  <tr className="border-border border-b text-left">
                    <th className="px-3 py-2 font-medium">Safehouse</th>
                    <th className="px-3 py-2 font-medium tabular-nums">Predicted</th>
                    <th className="px-3 py-2 font-medium tabular-nums">Actual</th>
                    <th className="px-3 py-2 font-medium tabular-nums">Delta</th>
                  </tr>
                </thead>
                <tbody>
                  {mlOutcomes.map((o) => {
                    const delta = o.predictedEducationProgress - o.actualEducationProgress
                    return (
                      <tr key={o.safehouseId} className="border-border border-b">
                        <td className="px-3 py-2">{o.safehouseName}</td>
                        <td className="px-3 py-2 tabular-nums">
                          {o.predictedEducationProgress.toFixed(2)}
                        </td>
                        <td className="px-3 py-2 tabular-nums">
                          {o.actualEducationProgress.toFixed(2)}
                        </td>
                        <td className="px-3 py-2 tabular-nums text-muted-foreground">
                          {delta >= 0 ? '+' : ''}
                          {delta.toFixed(2)}
                        </td>
                      </tr>
                    )
                  })}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>
      )}

      {showForm && (
        <form onSubmit={handleSave} className="bg-card border-border mb-6 rounded-lg border p-6">
          <h2 className="mb-4 text-lg font-semibold">{editingId ? 'Edit Safehouse' : 'New Safehouse'}</h2>
          <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
            <Input placeholder="Name" required value={form.name} onChange={(e) => updateField('name', e.target.value)} />
            <Input placeholder="Code" required value={form.safehouseCode} onChange={(e) => updateField('safehouseCode', e.target.value)} />
            <Input placeholder="Region" required value={form.region} onChange={(e) => updateField('region', e.target.value)} />
            <Input placeholder="City" required value={form.city} onChange={(e) => updateField('city', e.target.value)} />
            <Input placeholder="Province" required value={form.province} onChange={(e) => updateField('province', e.target.value)} />
            <Input placeholder="Country" required value={form.country} onChange={(e) => updateField('country', e.target.value)} />
            <select
              required
              value={form.status}
              onChange={(e) => updateField('status', e.target.value)}
              className="border-input bg-background mt-1 block w-full rounded-md border px-3 py-2 text-sm"
            >
              <option value="Active">Active</option>
              <option value="Inactive">Inactive</option>
              <option value="Maintenance">Maintenance</option>
              <option value="Full">Full</option>
            </select>
            <Input type="number" placeholder="Capacity (Girls)" value={form.capacityGirls || ''} onChange={(e) => updateField('capacityGirls', Number(e.target.value))} />
            <Input type="number" placeholder="Capacity (Staff)" value={form.capacityStaff || ''} onChange={(e) => updateField('capacityStaff', Number(e.target.value))} />
            <Input type="date" placeholder="Open Date" required value={form.openDate} onChange={(e) => updateField('openDate', e.target.value)} />
            <Input className="col-span-2" placeholder="Notes" value={form.notes} onChange={(e) => updateField('notes', e.target.value)} />
          </div>
          <div className="mt-4">
            <Button type="submit" disabled={saving}>
              {saving ? 'Saving...' : editingId ? 'Update Safehouse' : 'Save Safehouse'}
            </Button>
          </div>
        </form>
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
              <SelectItem value="Maintenance">Maintenance</SelectItem>
              <SelectItem value="Full">Full</SelectItem>
            </SelectGroup>
          </SelectContent>
        </Select>
      </div>

      <DataTable
        columns={columns}
        data={table.items}
        rowKey={(row) => row.safehouseId}
        sort={table.sort}
        onSort={table.setSort}
        page={table.page}
        totalPages={table.totalPages}
        totalCount={table.totalCount}
        onPageChange={table.setPage}
        loading={table.loading}
        onEdit={(row) => openEdit(row)}
        onDelete={async (row) => {
          await api.delete(`/api/admin/safehouses/${row.safehouseId}`)
          table.refresh()
        }}
        getCascadeInfo={(row) => api.get<CascadeImpact[]>(`/api/admin/safehouses/${row.safehouseId}/cascade-info`)}
        deleteEntityLabel="safehouse"
        getDeleteName={(row) => `${row.name} (${row.safehouseCode})`}
      />
    </div>
  )
}
