import { useCallback, useEffect, useState } from 'react'
import { api } from '@/api/client'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Input } from '@/components/ui/input'

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
    <div className="mx-auto max-w-7xl px-5 py-16 md:px-10 md:py-20">
      <div className="flex items-center justify-between mb-6">
        <div>
          <p className="text-muted-foreground text-sm font-semibold tracking-[0.18em] uppercase">
            Admin partnerships
          </p>
          <h1 className="font-heading mt-2 text-4xl font-semibold text-accent">
            Partners
          </h1>
        </div>
        <Button onClick={openCreate}>+ New Partner</Button>
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
          <h2 className="font-semibold">{editingId ? 'Edit Partner' : 'Create Partner'}</h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            <Input placeholder="Name" value={form.name} onChange={(e) => updateField('name', e.target.value)} />
            <Input placeholder="Type" value={form.type} onChange={(e) => updateField('type', e.target.value)} />
            <Input placeholder="Role" value={form.role} onChange={(e) => updateField('role', e.target.value)} />
            <Input placeholder="Contact" value={form.contact} onChange={(e) => updateField('contact', e.target.value)} />
            <Input placeholder="Email" value={form.email} onChange={(e) => updateField('email', e.target.value)} />
            <Input placeholder="Region" value={form.region} onChange={(e) => updateField('region', e.target.value)} />
            <Input placeholder="Status" value={form.status} onChange={(e) => updateField('status', e.target.value)} />
          </div>
          <div className="flex gap-2">
            <Button onClick={handleSave} disabled={saving}>{saving ? 'Saving...' : 'Save'}</Button>
            <Button variant="outline" onClick={() => setShowForm(false)}>Cancel</Button>
          </div>
          </CardContent>
        </Card>
      )}

      {/* Assignments detail panel */}
      {selectedPartner && (
        <Card className="mb-6 border-border/70 bg-card/95">
          <CardContent className="p-4">
          <div className="flex items-center justify-between mb-3">
            <h2 className="font-semibold">Assignments for {selectedPartner.name}</h2>
            <Button variant="outline" size="sm" onClick={() => setSelectedPartner(null)}>Close</Button>
          </div>
          {loadingAssignments ? (
            <p className="animate-pulse">Loading assignments...</p>
          ) : assignments.length === 0 ? (
            <p className="text-muted-foreground text-sm">No assignments found.</p>
          ) : (
            <table className="w-full text-sm">
              <thead>
                <tr className="border-border border-b text-left">
                  <th className="px-3 py-2">ID</th>
                  <th className="px-3 py-2">Description</th>
                  <th className="px-3 py-2">Status</th>
                  <th className="px-3 py-2">Assigned Date</th>
                </tr>
              </thead>
              <tbody>
                {assignments.map((a) => (
                  <tr key={a.assignmentId} className="border-border/70 border-b">
                    <td className="px-3 py-2">{a.assignmentId}</td>
                    <td className="px-3 py-2">{a.description}</td>
                    <td className="px-3 py-2">{a.status}</td>
                    <td className="px-3 py-2">{a.assignedDate?.split('T')[0]}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
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
                  <tr key={p.partnerId} className="border-border/70 hover:bg-secondary/40 border-b transition-colors">
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
                  <tr><td colSpan={9} className="text-muted-foreground px-3 py-4 text-center">No partners found.</td></tr>
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
