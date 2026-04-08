import { useCallback, useEffect, useState } from 'react'
import { api } from '@/api/client'
import { Button } from '@/components/ui/button'
import type { PaginatedResponse } from '@/api/types'

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

export function InterventionsPage() {
  const [interventions, setInterventions] = useState<Intervention[]>([])
  const [page, setPage] = useState(1)
  const [totalCount, setTotalCount] = useState(0)
  const [loading, setLoading] = useState(true)
  const [categoryFilter, setCategoryFilter] = useState('')
  const [statusFilter, setStatusFilter] = useState('')
  const [showForm, setShowForm] = useState(false)
  const [form, setForm] = useState(EMPTY_FORM)
  const [editId, setEditId] = useState<number | null>(null)
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState('')
  const pageSize = 20

  const fetchInterventions = useCallback(async () => {
    setLoading(true)
    try {
      const qs = new URLSearchParams({ page: String(page), pageSize: String(pageSize) })
      if (categoryFilter) qs.set('category', categoryFilter)
      if (statusFilter) qs.set('status', statusFilter)
      const res = await api.get<PaginatedResponse<Intervention>>(`/api/interventions?${qs}`)
      setInterventions(res.items)
      setTotalCount(res.totalCount)
    } catch (err) {
      console.error('Failed to load interventions', err)
    } finally {
      setLoading(false)
    }
  }, [page, categoryFilter, statusFilter])

  useEffect(() => {
    void fetchInterventions()
  }, [fetchInterventions])

  const totalPages = Math.ceil(totalCount / pageSize)

  function handleChange(e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) {
    const target = e.target
    setForm((prev) => ({ ...prev, [target.name]: target.value }))
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
      void fetchInterventions()
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to save intervention. Please try again.')
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
        <input
          type="text"
          placeholder="Filter by category..."
          value={categoryFilter}
          onChange={(e) => { setCategoryFilter(e.target.value); setPage(1) }}
          className="border-input bg-background rounded-md border px-3 py-2 text-sm"
        />
        <select
          value={statusFilter}
          onChange={(e) => { setStatusFilter(e.target.value); setPage(1) }}
          className="border-input bg-background rounded-md border px-3 py-2 text-sm"
        >
          <option value="">All statuses</option>
          <option value="Open">Open</option>
          <option value="In Progress">In Progress</option>
          <option value="On Hold">On Hold</option>
          <option value="Achieved">Achieved</option>
          <option value="Closed">Closed</option>
        </select>
      </div>

      {loading ? (
        <p className="text-muted-foreground animate-pulse">Loading...</p>
      ) : (
        <>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-border border-b text-left">
                  <th className="px-3 py-2 font-medium">Resident</th>
                  <th className="px-3 py-2 font-medium">Category</th>
                  <th className="px-3 py-2 font-medium">Description</th>
                  <th className="px-3 py-2 font-medium">Services</th>
                  <th className="px-3 py-2 font-medium">Target Date</th>
                  <th className="px-3 py-2 font-medium">Status</th>
                  <th className="px-3 py-2 font-medium"></th>
                </tr>
              </thead>
              <tbody>
                {interventions.map((item) => (
                  <tr key={item.planId} className="border-border border-b">
                    <td className="px-3 py-2">{item.residentCode ?? item.residentId}</td>
                    <td className="px-3 py-2">{item.planCategory}</td>
                    <td className="max-w-xs truncate px-3 py-2">{item.planDescription ?? '-'}</td>
                    <td className="max-w-xs truncate px-3 py-2">{item.servicesProvided ?? '-'}</td>
                    <td className="px-3 py-2">{item.targetDate ?? '-'}</td>
                    <td className="px-3 py-2">{item.status}</td>
                    <td className="px-3 py-2">
                      <button onClick={() => startEdit(item)} className="text-primary text-xs underline">
                        Edit
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {totalPages > 1 && (
            <div className="mt-4 flex items-center justify-between">
              <p className="text-muted-foreground text-sm">
                Page {page} of {totalPages} ({totalCount} records)
              </p>
              <div className="flex gap-2">
                <Button variant="outline" size="sm" disabled={page <= 1} onClick={() => setPage((p) => p - 1)}>
                  Previous
                </Button>
                <Button variant="outline" size="sm" disabled={page >= totalPages} onClick={() => setPage((p) => p + 1)}>
                  Next
                </Button>
              </div>
            </div>
          )}
        </>
      )}
    </div>
  )
}
