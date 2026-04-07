import { useCallback, useEffect, useState } from 'react'
import { api } from '@/api/client'
import { Button } from '@/components/ui/button'
import type { PaginatedResponse } from '@/api/types'

interface Incident {
  incidentReportId: number
  residentId: number
  residentCode: string | null
  safehouseName: string | null
  incidentDate: string
  incidentType: string
  severity: string
  resolved: boolean
  reportedBy: string | null
  description: string | null
}

const EMPTY_FORM = {
  residentId: '',
  incidentDate: '',
  incidentType: '',
  severity: '',
  description: '',
  actionsTaken: '',
  reportedBy: '',
  resolved: false,
}

export function IncidentsPage() {
  const [incidents, setIncidents] = useState<Incident[]>([])
  const [page, setPage] = useState(1)
  const [totalCount, setTotalCount] = useState(0)
  const [loading, setLoading] = useState(true)
  const [safehouseFilter, setSafehouseFilter] = useState('')
  const [severityFilter, setSeverityFilter] = useState('')
  const [resolvedFilter, setResolvedFilter] = useState('')
  const [showForm, setShowForm] = useState(false)
  const [form, setForm] = useState(EMPTY_FORM)
  const [editId, setEditId] = useState<number | null>(null)
  const [submitting, setSubmitting] = useState(false)
  const pageSize = 20

  const fetchIncidents = useCallback(async () => {
    setLoading(true)
    try {
      const qs = new URLSearchParams({ page: String(page), pageSize: String(pageSize) })
      if (safehouseFilter) qs.set('safehouse', safehouseFilter)
      if (severityFilter) qs.set('severity', severityFilter)
      if (resolvedFilter) qs.set('resolved', resolvedFilter)
      const res = await api.get<PaginatedResponse<Incident>>(`/api/incidents?${qs}`)
      setIncidents(res.items)
      setTotalCount(res.totalCount)
    } catch {
      // ignore
    } finally {
      setLoading(false)
    }
  }, [page, safehouseFilter, severityFilter, resolvedFilter])

  useEffect(() => {
    void fetchIncidents()
  }, [fetchIncidents])

  const totalPages = Math.ceil(totalCount / pageSize)

  function handleChange(e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) {
    const target = e.target
    const value = target instanceof HTMLInputElement && target.type === 'checkbox' ? (target as HTMLInputElement).checked : target.value
    setForm((prev) => ({ ...prev, [target.name]: value }))
  }

  function startEdit(incident: Incident) {
    setEditId(incident.incidentReportId)
    setForm({
      residentId: String(incident.residentId),
      incidentDate: incident.incidentDate,
      incidentType: incident.incidentType,
      severity: incident.severity,
      description: incident.description ?? '',
      actionsTaken: '',
      reportedBy: incident.reportedBy ?? '',
      resolved: incident.resolved,
    })
    setShowForm(true)
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setSubmitting(true)
    try {
      const body = {
        residentId: Number(form.residentId),
        incidentDate: form.incidentDate,
        incidentType: form.incidentType,
        severity: form.severity,
        description: form.description || null,
        actionsTaken: form.actionsTaken || null,
        reportedBy: form.reportedBy || null,
        resolved: form.resolved,
      }
      if (editId) {
        await api.put(`/api/incidents/${editId}`, body)
      } else {
        await api.post('/api/incidents', body)
      }
      setForm(EMPTY_FORM)
      setEditId(null)
      setShowForm(false)
      void fetchIncidents()
    } catch {
      // ignore
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
              <input name="reportedBy" type="text" value={form.reportedBy} onChange={handleChange} className="border-input bg-background mt-1 block w-full rounded-md border px-3 py-2 text-sm" />
            </label>
            <label className="flex items-center gap-2 self-end">
              <input name="resolved" type="checkbox" checked={form.resolved} onChange={handleChange} />
              <span className="text-sm">Resolved</span>
            </label>
            <label className="col-span-2 block">
              <span className="text-sm font-medium">Description</span>
              <textarea name="description" rows={3} value={form.description} onChange={handleChange} className="border-input bg-background mt-1 block w-full rounded-md border px-3 py-2 text-sm" />
            </label>
            <label className="col-span-2 block">
              <span className="text-sm font-medium">Actions Taken</span>
              <textarea name="actionsTaken" rows={2} value={form.actionsTaken} onChange={handleChange} className="border-input bg-background mt-1 block w-full rounded-md border px-3 py-2 text-sm" />
            </label>
          </div>
          <div className="mt-4">
            <Button type="submit" disabled={submitting}>
              {submitting ? 'Saving...' : editId ? 'Update Incident' : 'Save Incident'}
            </Button>
          </div>
        </form>
      )}

      <div className="mb-4 flex flex-wrap gap-3">
        <input
          type="text"
          placeholder="Filter by safehouse..."
          value={safehouseFilter}
          onChange={(e) => { setSafehouseFilter(e.target.value); setPage(1) }}
          className="border-input bg-background rounded-md border px-3 py-2 text-sm"
        />
        <select
          value={severityFilter}
          onChange={(e) => { setSeverityFilter(e.target.value); setPage(1) }}
          className="border-input bg-background rounded-md border px-3 py-2 text-sm"
        >
          <option value="">All severities</option>
          <option value="Low">Low</option>
          <option value="Medium">Medium</option>
          <option value="High">High</option>
          <option value="Critical">Critical</option>
        </select>
        <select
          value={resolvedFilter}
          onChange={(e) => { setResolvedFilter(e.target.value); setPage(1) }}
          className="border-input bg-background rounded-md border px-3 py-2 text-sm"
        >
          <option value="">All</option>
          <option value="true">Resolved</option>
          <option value="false">Unresolved</option>
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
                  <th className="px-3 py-2 font-medium">Date</th>
                  <th className="px-3 py-2 font-medium">Resident</th>
                  <th className="px-3 py-2 font-medium">Safehouse</th>
                  <th className="px-3 py-2 font-medium">Type</th>
                  <th className="px-3 py-2 font-medium">Severity</th>
                  <th className="px-3 py-2 font-medium">Resolved</th>
                  <th className="px-3 py-2 font-medium">Reported By</th>
                  <th className="px-3 py-2 font-medium"></th>
                </tr>
              </thead>
              <tbody>
                {incidents.map((inc) => (
                  <tr key={inc.incidentReportId} className="border-border border-b">
                    <td className="px-3 py-2">{inc.incidentDate}</td>
                    <td className="px-3 py-2">{inc.residentCode ?? inc.residentId}</td>
                    <td className="px-3 py-2">{inc.safehouseName ?? '-'}</td>
                    <td className="px-3 py-2">{inc.incidentType}</td>
                    <td className="px-3 py-2">{inc.severity}</td>
                    <td className="px-3 py-2">{inc.resolved ? 'Yes' : 'No'}</td>
                    <td className="px-3 py-2">{inc.reportedBy ?? '-'}</td>
                    <td className="px-3 py-2">
                      <button onClick={() => startEdit(inc)} className="text-primary text-xs underline">
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
