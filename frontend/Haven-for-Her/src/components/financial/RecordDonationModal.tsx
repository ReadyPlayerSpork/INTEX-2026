import { useState } from 'react'
import { Button } from '@/components/ui/button'
import type { RecordDonationRequest } from '@/api/financialApi'

interface RecordDonationModalProps {
  supporterId?: number
  onSubmit: (data: RecordDonationRequest) => Promise<void>
  onClose: () => void
}

export function RecordDonationModal({ supporterId, onSubmit, onClose }: RecordDonationModalProps) {
  const [form, setForm] = useState({
    supporterId: supporterId ? String(supporterId) : '',
    donationType: 'Monetary',
    donationDate: '',
    channelSource: '',
    currencyCode: 'USD',
    amount: '',
    estimatedValue: '',
    isRecurring: false,
    campaignName: '',
    notes: '',
  })
  const [submitting, setSubmitting] = useState(false)

  function handleChange(e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) {
    const target = e.target
    const value = target instanceof HTMLInputElement && target.type === 'checkbox' ? (target as HTMLInputElement).checked : target.value
    setForm((prev) => ({ ...prev, [target.name]: value }))
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setSubmitting(true)
    
    // Append extra info to notes to ensure it's saved without schema changes
    let finalNotes = form.notes || ''
    const extra: string[] = []
    if (form.donationType === 'InKind' && (form as any).itemCategory) extra.push(`Category: ${(form as any).itemCategory}`)
    if ((form.donationType === 'Time' || form.donationType === 'Skills') && (form as any).hours) extra.push(`Hours: ${(form as any).hours}`)
    if (form.donationType === 'SocialMedia' && (form as any).platform) extra.push(`Platform: ${(form as any).platform}`)
    
    if (extra.length > 0) {
      finalNotes = finalNotes ? `${finalNotes}\n[Details: ${extra.join(', ')}]` : `[Details: ${extra.join(', ')}]`
    }

    try {
      await onSubmit({
        supporterId: Number(form.supporterId),
        donationType: form.donationType,
        donationDate: form.donationDate,
        channelSource: form.channelSource,
        currencyCode: form.currencyCode || 'USD',
        amount: form.amount ? Number(form.amount) : null,
        estimatedValue: form.estimatedValue ? Number(form.estimatedValue) : null,
        isRecurring: form.isRecurring as boolean,
        campaignName: form.campaignName || null,
        notes: finalNotes || null,
      })
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40" onClick={onClose}>
      <div className="bg-card mx-4 w-full max-w-lg rounded-2xl p-6 shadow-lg" onClick={(e) => e.stopPropagation()}>
        <h2 className="mb-4 font-heading text-xl font-semibold text-plum">Record Donation</h2>
        <form onSubmit={handleSubmit} className="grid grid-cols-2 gap-4">
          <label className="block">
            <span className="text-sm font-medium text-soft-purple">Supporter ID</span>
            <input name="supporterId" type="number" required value={form.supporterId} onChange={handleChange} className="border-input bg-background mt-1 block w-full rounded-md border px-3 py-2 text-sm" />
          </label>
          <label className="block">
            <span className="text-sm font-medium text-soft-purple">Donation Type</span>
            <select name="donationType" value={form.donationType} onChange={handleChange} className="border-input bg-background mt-1 block w-full rounded-md border px-3 py-2 text-sm">
              <option value="Monetary">Monetary</option>
              <option value="InKind">In-Kind</option>
              <option value="Time">Time</option>
              <option value="Skills">Skills</option>
              <option value="SocialMedia">Social Media</option>
            </select>
          </label>
          <label className="block">
            <span className="text-sm font-medium text-soft-purple">Date</span>
            <input name="donationDate" type="date" required value={form.donationDate} onChange={handleChange} className="border-input bg-background mt-1 block w-full rounded-md border px-3 py-2 text-sm" />
          </label>
          <label className="block">
            <span className="text-sm font-medium text-soft-purple">Channel Source</span>
            <input name="channelSource" required value={form.channelSource} onChange={handleChange} className="border-input bg-background mt-1 block w-full rounded-md border px-3 py-2 text-sm" />
          </label>
          {form.donationType === 'Monetary' && (
            <>
              <label className="block">
                <span className="text-sm font-medium text-soft-purple">Amount</span>
                <input name="amount" type="number" step="0.01" value={form.amount} onChange={handleChange} className="border-input bg-background mt-1 block w-full rounded-md border px-3 py-2 text-sm" />
              </label>
              <label className="block">
                <span className="text-sm font-medium text-soft-purple">Currency</span>
                <input name="currencyCode" value={form.currencyCode} onChange={handleChange} className="border-input bg-background mt-1 block w-full rounded-md border px-3 py-2 text-sm" />
              </label>
            </>
          )}
          {form.donationType === 'InKind' && (
            <>
              <label className="block">
                <span className="text-sm font-medium text-soft-purple">Estimated Total Value</span>
                <input name="estimatedValue" type="number" step="0.01" value={form.estimatedValue} onChange={handleChange} className="border-input bg-background mt-1 block w-full rounded-md border px-3 py-2 text-sm" />
              </label>
              <label className="block">
                <span className="text-sm font-medium text-soft-purple">Item Category</span>
                <input name="itemCategory" placeholder="e.g. Hygiene, Food" value={(form as any).itemCategory ?? ''} onChange={handleChange} className="border-input bg-background mt-1 block w-full rounded-md border px-3 py-2 text-sm" />
              </label>
            </>
          )}
          {(form.donationType === 'Time' || form.donationType === 'Skills') && (
            <label className="col-span-2 block">
              <span className="text-sm font-medium text-soft-purple">Hours Contributed</span>
              <input name="hours" type="number" step="0.1" value={(form as any).hours ?? ''} onChange={handleChange} className="border-input bg-background mt-1 block w-full rounded-md border px-3 py-2 text-sm" />
            </label>
          )}
          {form.donationType === 'SocialMedia' && (
            <label className="col-span-2 block">
              <span className="text-sm font-medium text-soft-purple">Platform / Action</span>
              <input name="platform" placeholder="e.g. Instagram Share, Facebook Post" value={(form as any).platform ?? ''} onChange={handleChange} className="border-input bg-background mt-1 block w-full rounded-md border px-3 py-2 text-sm" />
            </label>
          )}
          <label className="block">
            <span className="text-sm font-medium text-soft-purple">Campaign</span>
            <input name="campaignName" value={form.campaignName} onChange={handleChange} className="border-input bg-background mt-1 block w-full rounded-md border px-3 py-2 text-sm" />
          </label>
          <label className="flex items-center gap-2 self-end">
            <input name="isRecurring" type="checkbox" checked={form.isRecurring as boolean} onChange={handleChange} />
            <span className="text-sm text-soft-purple">Recurring</span>
          </label>
          <label className="col-span-2 block">
            <span className="text-sm font-medium text-soft-purple">Notes</span>
            <textarea name="notes" rows={2} value={form.notes} onChange={handleChange} className="border-input bg-background mt-1 block w-full rounded-md border px-3 py-2 text-sm" />
          </label>
          <div className="col-span-2 flex justify-end gap-2 pt-2">
            <Button type="button" variant="outline" onClick={onClose}>Cancel</Button>
            <Button type="submit" disabled={submitting}>
              {submitting ? 'Saving...' : 'Record Donation'}
            </Button>
          </div>
        </form>
      </div>
    </div>
  )
}
