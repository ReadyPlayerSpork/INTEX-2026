import { useCallback, useEffect, useState } from 'react'
import { api } from '@/api/client'
import { Button } from '@/components/ui/button'

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
    <div className="mx-auto max-w-7xl px-4 py-8">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold">Safehouses</h1>
        <Button onClick={openCreate}>+ New Safehouse</Button>
      </div>

      {error && <p className="text-red-600 mb-4">{error}</p>}

      {/* Filters */}
      <div className="flex gap-3 mb-4">
        <input
          type="text"
          placeholder="Filter region..."
          value={filterRegion}
          onChange={(e) => { setFilterRegion(e.target.value); setPage(1) }}
          className="border rounded px-3 py-1 text-sm"
        />
        <input
          type="text"
          placeholder="Filter status..."
          value={filterStatus}
          onChange={(e) => { setFilterStatus(e.target.value); setPage(1) }}
          className="border rounded px-3 py-1 text-sm"
        />
      </div>

      {/* Create / Edit form */}
      {showForm && (
        <div className="border rounded p-4 mb-6 space-y-3">
          <h2 className="font-semibold">{editingId ? 'Edit Safehouse' : 'Create Safehouse'}</h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            <input placeholder="Name" value={form.name} onChange={(e) => updateField('name', e.target.value)} className="border rounded px-2 py-1 text-sm" />
            <input placeholder="Code" value={form.code} onChange={(e) => updateField('code', e.target.value)} className="border rounded px-2 py-1 text-sm" />
            <input placeholder="Region" value={form.region} onChange={(e) => updateField('region', e.target.value)} className="border rounded px-2 py-1 text-sm" />
            <input placeholder="City" value={form.city} onChange={(e) => updateField('city', e.target.value)} className="border rounded px-2 py-1 text-sm" />
            <input placeholder="Status" value={form.status} onChange={(e) => updateField('status', e.target.value)} className="border rounded px-2 py-1 text-sm" />
            <input type="number" placeholder="Capacity" value={form.capacity || ''} onChange={(e) => updateField('capacity', Number(e.target.value))} className="border rounded px-2 py-1 text-sm" />
            <input type="date" placeholder="Open Date" value={form.openDate} onChange={(e) => updateField('openDate', e.target.value)} className="border rounded px-2 py-1 text-sm" />
          </div>
          <div className="flex gap-2">
            <Button onClick={handleSave} disabled={saving}>{saving ? 'Saving...' : 'Save'}</Button>
            <Button variant="outline" onClick={() => setShowForm(false)}>Cancel</Button>
          </div>
        </div>
      )}

      {/* Table */}
      {loading ? (
        <p className="animate-pulse">Loading...</p>
      ) : (
        <>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b text-left">
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
                  <tr key={s.safehouseId} className="border-b hover:bg-gray-50">
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
                  <tr><td colSpan={9} className="px-3 py-4 text-center text-gray-500">No safehouses found.</td></tr>
                )}
              </tbody>
            </table>
          </div>

          {totalPages > 1 && (
            <div className="mt-4 flex items-center justify-between">
              <p className="text-sm text-gray-500">Page {page} of {totalPages} ({totalCount} total)</p>
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
