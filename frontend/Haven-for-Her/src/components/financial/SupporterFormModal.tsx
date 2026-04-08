import { useState } from 'react'
import { Button } from '@/components/ui/button'
import type { CreateSupporterRequest } from '@/api/financialApi'

interface SupporterFormModalProps {
  initial?: CreateSupporterRequest | null
  onSubmit: (data: CreateSupporterRequest) => Promise<void>
  onClose: () => void
}

const EMPTY: CreateSupporterRequest = {
  supporterType: 'Individual',
  displayName: '',
  organizationName: '',
  firstName: '',
  lastName: '',
  relationshipType: 'Donor',
  region: '',
  country: '',
  email: '',
  phone: '',
  status: 'Active',
  acquisitionChannel: '',
}

export function SupporterFormModal({ initial, onSubmit, onClose }: SupporterFormModalProps) {
  const [form, setForm] = useState<CreateSupporterRequest>(initial ?? EMPTY)
  const [submitting, setSubmitting] = useState(false)

  function handleChange(e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) {
    setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }))
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setSubmitting(true)
    try {
      await onSubmit(form)
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40" onClick={onClose}>
      <div className="bg-card mx-4 w-full max-w-2xl rounded-2xl p-6 shadow-lg" onClick={(e) => e.stopPropagation()}>
        <h2 className="mb-4 font-heading text-xl font-semibold text-plum">
          {initial ? 'Edit Supporter' : 'New Supporter'}
        </h2>
        <form onSubmit={handleSubmit} className="grid grid-cols-2 gap-4">
          <label className="block">
            <span className="text-sm font-medium text-soft-purple">Display Name</span>
            <input name="displayName" required value={form.displayName} onChange={handleChange} className="border-input bg-background mt-1 block w-full rounded-md border px-3 py-2 text-sm" />
          </label>
          <label className="block">
            <span className="text-sm font-medium text-soft-purple">Supporter Type</span>
            <select name="supporterType" value={form.supporterType} onChange={handleChange} className="border-input bg-background mt-1 block w-full rounded-md border px-3 py-2 text-sm">
              <option value="MonetaryDonor">Monetary Donor</option>
              <option value="InKindDonor">In-Kind Donor</option>
              <option value="Volunteer">Volunteer</option>
              <option value="SocialMediaAdvocate">Social Media Advocate</option>
            </select>
          </label>
          <label className="block">
            <span className="text-sm font-medium text-soft-purple">First Name</span>
            <input name="firstName" value={form.firstName ?? ''} onChange={handleChange} className="border-input bg-background mt-1 block w-full rounded-md border px-3 py-2 text-sm" />
          </label>
          <label className="block">
            <span className="text-sm font-medium text-soft-purple">Last Name</span>
            <input name="lastName" value={form.lastName ?? ''} onChange={handleChange} className="border-input bg-background mt-1 block w-full rounded-md border px-3 py-2 text-sm" />
          </label>
          {form.supporterType === 'Organization' && (
            <label className="col-span-2 block">
              <span className="text-sm font-medium text-soft-purple">Organization Name</span>
              <input name="organizationName" value={form.organizationName ?? ''} onChange={handleChange} className="border-input bg-background mt-1 block w-full rounded-md border px-3 py-2 text-sm" />
            </label>
          )}
          <label className="block">
            <span className="text-sm font-medium text-soft-purple">Email</span>
            <input name="email" type="email" required value={form.email} onChange={handleChange} className="border-input bg-background mt-1 block w-full rounded-md border px-3 py-2 text-sm" />
          </label>
          <label className="block">
            <span className="text-sm font-medium text-soft-purple">Phone</span>
            <input name="phone" value={form.phone} onChange={handleChange} className="border-input bg-background mt-1 block w-full rounded-md border px-3 py-2 text-sm" />
          </label>
          <label className="block">
            <span className="text-sm font-medium text-soft-purple">Relationship Type</span>
            <select name="relationshipType" value={form.relationshipType} onChange={handleChange} className="border-input bg-background mt-1 block w-full rounded-md border px-3 py-2 text-sm">
              <option value="Donor">Donor</option>
              <option value="Volunteer">Volunteer</option>
              <option value="Skills Contributor">Skills Contributor</option>
              <option value="Corporate Partner">Corporate Partner</option>
              <option value="In-Kind Donor">In-Kind Donor</option>
            </select>
          </label>
          <label className="block">
            <span className="text-sm font-medium text-soft-purple">Status</span>
            <select name="status" value={form.status} onChange={handleChange} className="border-input bg-background mt-1 block w-full rounded-md border px-3 py-2 text-sm">
              <option value="Active">Active</option>
              <option value="Inactive">Inactive</option>
            </select>
          </label>
          <label className="block">
            <span className="text-sm font-medium text-soft-purple">Region</span>
            <input name="region" value={form.region} onChange={handleChange} className="border-input bg-background mt-1 block w-full rounded-md border px-3 py-2 text-sm" />
          </label>
          <label className="block">
            <span className="text-sm font-medium text-soft-purple">Country</span>
            <input name="country" value={form.country} onChange={handleChange} className="border-input bg-background mt-1 block w-full rounded-md border px-3 py-2 text-sm" />
          </label>
          <label className="block">
            <span className="text-sm font-medium text-soft-purple">Acquisition Channel</span>
            <input name="acquisitionChannel" value={form.acquisitionChannel} onChange={handleChange} className="border-input bg-background mt-1 block w-full rounded-md border px-3 py-2 text-sm" />
          </label>
          <div className="col-span-2 flex justify-end gap-2 pt-2">
            <Button type="button" variant="outline" onClick={onClose}>Cancel</Button>
            <Button type="submit" disabled={submitting}>
              {submitting ? 'Saving...' : initial ? 'Update' : 'Create'}
            </Button>
          </div>
        </form>
      </div>
    </div>
  )
}
