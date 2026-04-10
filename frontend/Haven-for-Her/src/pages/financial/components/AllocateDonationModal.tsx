import { useEffect, useState } from 'react'
import { api } from '@/api/client'
import { Button } from '@/components/ui/button'

interface Safehouse {
  safehouseId: number
  name: string
}

interface Allocation {
  allocationId?: number
  safehouseId: number
  safehouseName?: string
  programArea: string
  amountAllocated: number
  allocationDate: string
}

interface AllocateDonationModalProps {
  donationId: number
  donationAmount: number
  currencyCode: string
  onClose: () => void
  onSaved: () => void
}

const PROGRAM_AREAS = [
  'Education',
  'Wellbeing/Health',
  'Operations',
  'Legal/Advocacy',
  'Caring (Direct Care)',
  'Healing (Counseling)',
  'Teaching (Skills)',
]

export function AllocateDonationModal({
  donationId,
  donationAmount,
  currencyCode,
  onClose,
  onSaved,
}: AllocateDonationModalProps) {
  const [safehouses, setSafehouses] = useState<Safehouse[]>([])
  const [existingAllocations, setExistingAllocations] = useState<Allocation[]>([])
  const [loading, setLoading] = useState(true)
  const [submitting, setSubmitting] = useState(false)

  const [form, setForm] = useState({
    safehouseId: '',
    programArea: PROGRAM_AREAS[0],
    amountAllocated: '',
  })

  useEffect(() => {
    let cancelled = false
    setLoading(true)
    Promise.all([
      api.get<Safehouse[]>('/api/public/safehouses'),
      api.get<{ items?: Allocation[] }>(
        `/api/financial/management/allocations?donationId=${donationId}&pageSize=500`,
      ),
    ])
      .then(([sh, allocs]) => {
        if (cancelled) return
        setSafehouses(sh)
        setExistingAllocations(allocs.items ?? [])
      })
      .catch(() => {
        if (!cancelled) setExistingAllocations([])
      })
      .finally(() => {
        if (!cancelled) setLoading(false)
      })
    return () => {
      cancelled = true
    }
  }, [donationId])

  const totalAllocated = existingAllocations.reduce((sum, a) => sum + a.amountAllocated, 0)
  const remaining = donationAmount - totalAllocated

  async function handleAddAllocation(e: React.FormEvent) {
    e.preventDefault()
    if (!form.safehouseId || !form.amountAllocated) return

    setSubmitting(true)
    try {
      await api.post(`/api/financial/management/donations/${donationId}/allocations`, {
        safehouseId: Number(form.safehouseId),
        programArea: form.programArea,
        amountAllocated: Number(form.amountAllocated),
        allocationDate: new Date().toISOString().split('T')[0],
      })
      // Refresh
      const res = await api.get<any>(`/api/financial/management/allocations?donationId=${donationId}`)
      setExistingAllocations(res.items || [])
      setForm({ ...form, amountAllocated: '' })
      onSaved()
    } finally {
      setSubmitting(false)
    }
  }

  async function handleDelete(id: number) {
    if (!confirm('Delete this allocation?')) return
    await api.delete(`/api/financial/management/allocations/${id}`)
    const res = await api.get<any>(`/api/financial/management/allocations?donationId=${donationId}`)
    setExistingAllocations(res.items || [])
    onSaved()
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40" onClick={onClose}>
      <div className="bg-card mx-4 w-full max-w-2xl rounded-2xl p-6 shadow-lg" onClick={(e) => e.stopPropagation()}>
        <div className="mb-6 flex items-center justify-between">
          <h2 className="font-heading text-xl font-semibold text-plum">Allocate Donation #{donationId}</h2>
          <div className="text-right">
            <p className="text-sm text-muted-foreground">Total: <span className="font-bold text-foreground">{currencyCode} {donationAmount.toLocaleString()}</span></p>
            <p className="text-sm text-muted-foreground">Remaining: <span className={`font-bold ${remaining < 0 ? 'text-destructive' : 'text-primary'}`}>{currencyCode} {remaining.toLocaleString()}</span></p>
          </div>
        </div>

        {loading ? (
          <p className="animate-pulse text-muted-foreground">Loading safehouses...</p>
        ) : (
          <div className="space-y-6">
            <form onSubmit={handleAddAllocation} className="bg-muted/30 grid grid-cols-3 gap-3 rounded-xl border border-dashed border-border p-4">
              <label className="block">
                <span className="text-xs font-medium text-soft-purple">Safehouse</span>
                <select 
                    value={form.safehouseId} 
                    onChange={e => setForm({...form, safehouseId: e.target.value})}
                    className="border-input bg-background mt-1 block w-full rounded-md border px-3 py-2 text-sm"
                    required
                >
                  <option value="">Select...</option>
                  {safehouses.map(s => <option key={s.safehouseId} value={s.safehouseId}>{s.name}</option>)}
                </select>
              </label>
              <label className="block">
                <span className="text-xs font-medium text-soft-purple">Program Area</span>
                <select 
                    value={form.programArea} 
                    onChange={e => setForm({...form, programArea: e.target.value})}
                    className="border-input bg-background mt-1 block w-full rounded-md border px-3 py-2 text-sm"
                >
                  {PROGRAM_AREAS.map(p => <option key={p} value={p}>{p}</option>)}
                </select>
              </label>
              <div className="flex items-end gap-2">
                <label className="block flex-1">
                  <span className="text-xs font-medium text-soft-purple">Amount</span>
                  <input 
                    type="number" 
                    step="0.01" 
                    value={form.amountAllocated} 
                    onChange={e => setForm({...form, amountAllocated: e.target.value})}
                    className="border-input bg-background mt-1 block w-full rounded-md border px-3 py-2 text-sm"
                    required
                  />
                </label>
                <Button type="submit" disabled={submitting || remaining <= 0}>Add</Button>
              </div>
            </form>

            <div>
              <h3 className="mb-3 text-xs font-bold uppercase tracking-wider text-muted-foreground">Current Allocations</h3>
              {existingAllocations.length === 0 ? (
                <p className="text-sm text-muted-foreground italic">No allocations yet.</p>
              ) : (
                <div className="divide-y divide-border overflow-hidden rounded-xl border border-border">
                  {existingAllocations.map(a => (
                    <div key={a.allocationId} className="flex items-center justify-between bg-card px-4 py-3 text-sm">
                      <div>
                        <span className="font-bold text-accent">{a.safehouseName}</span>
                        <span className="mx-2 text-muted-foreground">/</span>
                        <span className="text-plum">{a.programArea}</span>
                      </div>
                      <div className="flex items-center gap-4">
                        <span className="font-bold">{currencyCode} {a.amountAllocated.toLocaleString()}</span>
                        <button 
                            onClick={() => a.allocationId && handleDelete(a.allocationId)}
                            className="text-destructive hover:text-destructive/80 font-medium"
                        >
                          Delete
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            <div className="flex justify-end pt-4">
              <Button variant="outline" onClick={onClose}>Close</Button>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
