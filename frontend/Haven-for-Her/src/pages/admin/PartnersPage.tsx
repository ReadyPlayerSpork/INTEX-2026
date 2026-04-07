import { useCallback, useEffect, useState } from 'react'
import { api } from '@/api/client'
import { Button } from '@/components/ui/button'

/* ---------- Types ---------- */

interface Partner {
  partnerId: number
  name: string
  type: string
  role: string
  contact: string
  email: string
  region: string
  status: string
  assignmentsCount: number
}

interface PagedResult {
  items: Partner[]
  totalCount: number
}

interface PartnerForm {
  name: string
  type: string
  role: string
  contact: string
  email: string
  region: string
  status: string
}

interface Assignment {
  assignmentId: number
  description: string
  status: string
  assignedDate: string
}

const EMPTY_FORM: PartnerForm = {
  name: '',
  type: '',
  role: '',
  contact: '',
  email: '',
  region: '',
  status: 'Active',
}

/* ---------- Page ---------- */

export function PartnersPage() {
  const [items, setItems] = useState<Partner[]>([])
  const [totalCount, setTotalCount] = useState(0)
  const [page, setPage] = useState(1)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const pageSize = 20

  /* filters */
  const [filterRegion, setFilterRegion] = useState('')
  const [filterStatus, setFilterStatus] = useState('')

  /* form */
  const [showForm, setShowForm] = useState(false)
  const [editingId, setEditingId] = useState<number | null>(null)
  const [form, setForm] = useState<PartnerForm>(EMPTY_FORM)
  const [saving, setSaving] = useState(false)

  /* delete */
  const [deletingId, setDeletingId] = useState<number | null>(null)

  /* detail view */
  const [selectedPartner, setSelectedPartner] = useState<Partner | null>(null)
  const [assignments, setAssignments] = useState<Assignment[]>([])
  const [loadingAssignments, setLoadingAssignments] = useState(false)

  const fetchData = useCallback(async () => {
    setLoading(true)
    setError('')
    try {
      const params = new URLSearchParams({ page: String(page), pageSize: String(pageSize) })
      if (filterRegion) params.set('region', filterRegion)
      if (filterStatus) params.set('status', filterStatus)
      const res = await api.get<PagedResult>(`/api/admin/partners?${params}`)
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
    setSelectedPartner(null)
  }

  const openEdit = (p: Partner) => {
    setEditingId(p.partnerId)
    setForm({
      name: p.name,
      type: p.type,
      role: p.role,
      contact: p.contact,
      email: p.email,
      region: p.region,
      status: p.status,
    })
    setShowForm(true)
    setSelectedPartner(null)
  }

  const handleSave = async () => {
    setSaving(true)
    try {
      if (editingId) {
        await api.put(`/api/admin/partners/${editingId}`, form)
      } else {
        await api.post('/api/admin/partners', form)
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
      await api.delete(`/api/admin/partners/${id}`)
      setDeletingId(null)
      await fetchData()
    } catch (err) {
      setError(String(err))
    }
  }

  const viewAssignments = async (p: Partner) => {
    setSelectedPartner(p)
    setShowForm(false)
    setLoadingAssignments(true)
    try {
      const res = await api.get<Assignment[]>(`/api/admin/partners/${p.partnerId}/assignments`)
      setAssignments(res)
    } catch (err) {
      setError(String(err))
    } finally {
      setLoadingAssignments(false)
    }
  }

  const updateField = (field: keyof PartnerForm, value: string) => {
    setForm((prev) => ({ ...prev, [field]: value }))
  }

  return (
    <div className="mx-auto max-w-7xl px-4 py-8">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold">Partners</h1>
        <Button onClick={openCreate}>+ New Partner</Button>
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
          <h2 className="font-semibold">{editingId ? 'Edit Partner' : 'Create Partner'}</h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            <input placeholder="Name" value={form.name} onChange={(e) => updateField('name', e.target.value)} className="border rounded px-2 py-1 text-sm" />
            <input placeholder="Type" value={form.type} onChange={(e) => updateField('type', e.target.value)} className="border rounded px-2 py-1 text-sm" />
            <input placeholder="Role" value={form.role} onChange={(e) => updateField('role', e.target.value)} className="border rounded px-2 py-1 text-sm" />
            <input placeholder="Contact" value={form.contact} onChange={(e) => updateField('contact', e.target.value)} className="border rounded px-2 py-1 text-sm" />
            <input placeholder="Email" value={form.email} onChange={(e) => updateField('email', e.target.value)} className="border rounded px-2 py-1 text-sm" />
            <input placeholder="Region" value={form.region} onChange={(e) => updateField('region', e.target.value)} className="border rounded px-2 py-1 text-sm" />
            <input placeholder="Status" value={form.status} onChange={(e) => updateField('status', e.target.value)} className="border rounded px-2 py-1 text-sm" />
          </div>
          <div className="flex gap-2">
            <Button onClick={handleSave} disabled={saving}>{saving ? 'Saving...' : 'Save'}</Button>
            <Button variant="outline" onClick={() => setShowForm(false)}>Cancel</Button>
          </div>
        </div>
      )}

      {/* Assignments detail panel */}
      {selectedPartner && (
        <div className="border rounded p-4 mb-6">
          <div className="flex items-center justify-between mb-3">
            <h2 className="font-semibold">Assignments for {selectedPartner.name}</h2>
            <Button variant="outline" size="sm" onClick={() => setSelectedPartner(null)}>Close</Button>
          </div>
          {loadingAssignments ? (
            <p className="animate-pulse">Loading assignments...</p>
          ) : assignments.length === 0 ? (
            <p className="text-gray-500 text-sm">No assignments found.</p>
          ) : (
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b text-left">
                  <th className="px-3 py-2">ID</th>
                  <th className="px-3 py-2">Description</th>
                  <th className="px-3 py-2">Status</th>
                  <th className="px-3 py-2">Assigned Date</th>
                </tr>
              </thead>
              <tbody>
                {assignments.map((a) => (
                  <tr key={a.assignmentId} className="border-b">
                    <td className="px-3 py-2">{a.assignmentId}</td>
                    <td className="px-3 py-2">{a.description}</td>
                    <td className="px-3 py-2">{a.status}</td>
                    <td className="px-3 py-2">{a.assignedDate?.split('T')[0]}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
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
                  <th className="px-3 py-2">Type</th>
                  <th className="px-3 py-2">Role</th>
                  <th className="px-3 py-2">Contact</th>
                  <th className="px-3 py-2">Email</th>
                  <th className="px-3 py-2">Region</th>
                  <th className="px-3 py-2">Status</th>
                  <th className="px-3 py-2">Assignments</th>
                  <th className="px-3 py-2">Actions</th>
                </tr>
              </thead>
              <tbody>
                {items.map((p) => (
                  <tr key={p.partnerId} className="border-b hover:bg-gray-50">
                    <td className="px-3 py-2">
                      <button className="underline text-left" onClick={() => viewAssignments(p)}>{p.name}</button>
                    </td>
                    <td className="px-3 py-2">{p.type}</td>
                    <td className="px-3 py-2">{p.role}</td>
                    <td className="px-3 py-2">{p.contact}</td>
                    <td className="px-3 py-2">{p.email}</td>
                    <td className="px-3 py-2">{p.region}</td>
                    <td className="px-3 py-2">{p.status}</td>
                    <td className="px-3 py-2">{p.assignmentsCount}</td>
                    <td className="px-3 py-2 flex gap-1">
                      <Button size="sm" variant="outline" onClick={() => openEdit(p)}>Edit</Button>
                      {deletingId === p.partnerId ? (
                        <>
                          <Button size="sm" variant="destructive" onClick={() => handleDelete(p.partnerId)}>Confirm</Button>
                          <Button size="sm" variant="outline" onClick={() => setDeletingId(null)}>Cancel</Button>
                        </>
                      ) : (
                        <Button size="sm" variant="outline" onClick={() => setDeletingId(p.partnerId)}>Delete</Button>
                      )}
                    </td>
                  </tr>
                ))}
                {items.length === 0 && (
                  <tr><td colSpan={9} className="px-3 py-4 text-center text-gray-500">No partners found.</td></tr>
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
