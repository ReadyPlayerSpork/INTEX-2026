import { useCallback, useEffect, useState } from 'react'
import { api } from '@/api/client'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Input } from '@/components/ui/input'

/* ---------- Types ---------- */

interface Safehouse {
  safehouseId: number
  name: string
  code: string
  region: string
  city: string
  status: string
  capacity: number
  currentOccupancy: number
  openDate: string
}

interface PagedResult {
  items: Safehouse[]
  totalCount: number
}

interface SafehouseForm {
  name: string
  code: string
  region: string
  city: string
  status: string
  capacity: number
  openDate: string
}

const EMPTY_FORM: SafehouseForm = {
  name: '',
  code: '',
  region: '',
  city: '',
  status: 'Active',
  capacity: 0,
  openDate: '',
}

/* ---------- Page ---------- */

export function SafehousesPage() {
  const [items, setItems] = useState<Safehouse[]>([])
  const [totalCount, setTotalCount] = useState(0)
  const [page, setPage] = useState(1)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const pageSize = 20

  /* filters */
  const [filterRegion, setFilterRegion] = useState('')
  const [filterStatus, setFilterStatus] = useState('')

  /* form state */
  const [showForm, setShowForm] = useState(false)
  const [editingId, setEditingId] = useState<number | null>(null)
  const [form, setForm] = useState<SafehouseForm>(EMPTY_FORM)
  const [saving, setSaving] = useState(false)

  /* delete */
  const [deletingId, setDeletingId] = useState<number | null>(null)

  const fetchData = useCallback(async () => {
    setLoading(true)
    setError('')
    try {
      const params = new URLSearchParams({ page: String(page), pageSize: String(pageSize) })
      if (filterRegion) params.set('region', filterRegion)
      if (filterStatus) params.set('status', filterStatus)
      const res = await api.get<PagedResult>(`/api/admin/safehouses?${params}`)
      setItems(res.items)
      setTotalCount(res.totalCount)
    } catch (err) {
      setError(String(err))
    } finally {
      setLoading(false)
    }
  }, [page, filterRegion, filterStatus])

  useEffect(() => {
    void fetchData()
  }, [fetchData])

  const totalPages = Math.ceil(totalCount / pageSize)

  const openCreate = () => {
    setEditingId(null)
    setForm(EMPTY_FORM)
    setShowForm(true)
  }

  const openEdit = (s: Safehouse) => {
    setEditingId(s.safehouseId)
    setForm({
      name: s.name,
      code: s.code,
      region: s.region,
      city: s.city,
      status: s.status,
      capacity: s.capacity,
      openDate: s.openDate?.split('T')[0] ?? '',
    })
    setShowForm(true)
  }

  const handleSave = async () => {
    setSaving(true)
    try {
      if (editingId) {
        await api.put(`/api/admin/safehouses/${editingId}`, form)
      } else {
        await api.post('/api/admin/safehouses', form)
      }
      setShowForm(false)
      await fetchData()
    } catch (err) {
      setError(String(err))
    } finally {
      setSaving(false)
    }
  }

  const handleDelete = async (id: number) => {
    try {
      await api.delete(`/api/admin/safehouses/${id}`)
      setDeletingId(null)
      await fetchData()
    } catch (err) {
      setError(String(err))
    }
  }

  const updateField = (field: keyof SafehouseForm, value: string | number) => {
    setForm((prev) => ({ ...prev, [field]: value }))
  }

  return (
    <div className="mx-auto max-w-7xl px-5 py-16 md:px-10 md:py-20">
      <div className="flex items-center justify-between mb-6">
        <div>
          <p className="text-muted-foreground text-sm font-semibold tracking-[0.18em] uppercase">
            Admin safehouses
          </p>
          <h1 className="font-heading mt-2 text-4xl font-semibold text-accent">
            Safehouses
          </h1>
        </div>
        <Button onClick={openCreate}>+ New Safehouse</Button>
      </div>

      {error && <p className="text-destructive mb-4">{error}</p>}

      {/* Filters */}
      <div className="flex gap-3 mb-4">
        <Input
          type="text"
          placeholder="Filter region..."
          value={filterRegion}
          onChange={(e) => { setFilterRegion(e.target.value); setPage(1) }}
          className="max-w-xs"
        />
        <Input
          type="text"
          placeholder="Filter status..."
          value={filterStatus}
          onChange={(e) => { setFilterStatus(e.target.value); setPage(1) }}
          className="max-w-xs"
        />
      </div>

      {/* Create / Edit form */}
      {showForm && (
        <Card className="mb-6 border-border/70 bg-card/95">
          <CardContent className="space-y-3 p-4">
          <h2 className="font-semibold">{editingId ? 'Edit Safehouse' : 'Create Safehouse'}</h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            <Input placeholder="Name" value={form.name} onChange={(e) => updateField('name', e.target.value)} />
            <Input placeholder="Code" value={form.code} onChange={(e) => updateField('code', e.target.value)} />
            <Input placeholder="Region" value={form.region} onChange={(e) => updateField('region', e.target.value)} />
            <Input placeholder="City" value={form.city} onChange={(e) => updateField('city', e.target.value)} />
            <Input placeholder="Status" value={form.status} onChange={(e) => updateField('status', e.target.value)} />
            <Input type="number" placeholder="Capacity" value={form.capacity || ''} onChange={(e) => updateField('capacity', Number(e.target.value))} />
            <Input type="date" placeholder="Open Date" value={form.openDate} onChange={(e) => updateField('openDate', e.target.value)} />
          </div>
          <div className="flex gap-2">
            <Button onClick={handleSave} disabled={saving}>{saving ? 'Saving...' : 'Save'}</Button>
            <Button variant="outline" onClick={() => setShowForm(false)}>Cancel</Button>
          </div>
          </CardContent>
        </Card>
      )}

      {/* Table */}
      {loading ? (
        <p className="animate-pulse">Loading...</p>
      ) : (
        <>
          <Card className="overflow-hidden border-border/70 bg-card/95">
            <CardContent className="p-0">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-border bg-secondary/50 border-b text-left">
                  <th className="px-3 py-2">Name</th>
                  <th className="px-3 py-2">Code</th>
                  <th className="px-3 py-2">Region</th>
                  <th className="px-3 py-2">City</th>
                  <th className="px-3 py-2">Status</th>
                  <th className="px-3 py-2">Capacity</th>
                  <th className="px-3 py-2">Occupancy</th>
                  <th className="px-3 py-2">Open Date</th>
                  <th className="px-3 py-2">Actions</th>
                </tr>
              </thead>
              <tbody>
                {items.map((s) => (
                  <tr key={s.safehouseId} className="border-border/70 hover:bg-secondary/40 border-b transition-colors">
                    <td className="px-3 py-2">{s.name}</td>
                    <td className="px-3 py-2">{s.code}</td>
                    <td className="px-3 py-2">{s.region}</td>
                    <td className="px-3 py-2">{s.city}</td>
                    <td className="px-3 py-2">{s.status}</td>
                    <td className="px-3 py-2">{s.capacity}</td>
                    <td className="px-3 py-2">{s.currentOccupancy}</td>
                    <td className="px-3 py-2">{s.openDate?.split('T')[0]}</td>
                    <td className="px-3 py-2 flex gap-1">
                      <Button size="sm" variant="outline" onClick={() => openEdit(s)}>Edit</Button>
                      {deletingId === s.safehouseId ? (
                        <>
                          <Button size="sm" variant="destructive" onClick={() => handleDelete(s.safehouseId)}>Confirm</Button>
                          <Button size="sm" variant="outline" onClick={() => setDeletingId(null)}>Cancel</Button>
                        </>
                      ) : (
                        <Button size="sm" variant="outline" onClick={() => setDeletingId(s.safehouseId)}>Delete</Button>
                      )}
                    </td>
                  </tr>
                ))}
                {items.length === 0 && (
                  <tr><td colSpan={9} className="text-muted-foreground px-3 py-4 text-center">No safehouses found.</td></tr>
                )}
              </tbody>
            </table>
          </div>
            </CardContent>
          </Card>

          {totalPages > 1 && (
            <div className="mt-4 flex items-center justify-between">
              <p className="text-muted-foreground text-sm">Page {page} of {totalPages} ({totalCount} total)</p>
              <div className="flex gap-2">
                <Button variant="outline" size="sm" disabled={page <= 1} onClick={() => setPage((p) => p - 1)}>Previous</Button>
                <Button variant="outline" size="sm" disabled={page >= totalPages} onClick={() => setPage((p) => p + 1)}>Next</Button>
              </div>
            </div>
          )}
        </>
      )}
    </div>
  )
}
