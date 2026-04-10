import { useState, useEffect } from 'react'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Label } from '@/components/ui/label'
import { financialApi } from '@/api/financialApi'

/** Donation row shape from financial list APIs (edit modal). */
export interface EditableDonation {
  donationId: number
  donationType?: string
  donationDate?: string
  amount?: number | null
  estimatedValue?: number | null
  currencyCode?: string
  campaignName?: string | null
  channelSource?: string | null
  isRecurring?: boolean
}

export function EditDonationModal({
  donation,
  open,
  onOpenChange,
  onSaved,
}: {
  donation: EditableDonation | null
  open: boolean
  onOpenChange: (open: boolean) => void
  onSaved: () => void
}) {
  const [loading, setLoading] = useState(false)
  const [formData, setFormData] = useState({
    donationType: 'Monetary',
    donationDate: '',
    amount: '',
    estimatedValue: '',
    currencyCode: 'USD',
    campaignName: '',
    channelSource: 'Online',
    isRecurring: false,
  })

  useEffect(() => {
    if (donation && open) {
      // In Javascript Date objects, value must be parsed into YYYY-MM-DD for standard date inputs
      // the api returns donationDate as a string, likely ISO 8601 or YYYY-MM-DD
      const dateStr = donation.donationDate ? donation.donationDate.split('T')[0] : ''
      setFormData({
        donationType: donation.donationType || 'Monetary',
        donationDate: dateStr,
        amount: donation.amount?.toString() || '',
        estimatedValue: donation.estimatedValue?.toString() || '',
        currencyCode: donation.currencyCode || 'USD',
        campaignName: donation.campaignName || '',
        channelSource: donation.channelSource || 'Online',
        isRecurring: !!donation.isRecurring,
      })
    }
  }, [donation, open])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!donation) return
    
    setLoading(true)
    try {
      await financialApi.updateDonation(donation.donationId, {
        donationType: formData.donationType,
        donationDate: formData.donationDate,
        amount: formData.amount ? parseFloat(formData.amount) : null,
        estimatedValue: formData.estimatedValue ? parseFloat(formData.estimatedValue) : null,
        currencyCode: formData.currencyCode,
        campaignName: formData.campaignName,
        channelSource: formData.channelSource,
        isRecurring: formData.isRecurring,
      })
      onSaved()
      onOpenChange(false)
    } finally {
      setLoading(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Edit Donation</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Date</Label>
              <Input
                type="date"
                required
                value={formData.donationDate}
                onChange={(e) => setFormData({ ...formData, donationDate: e.target.value })}
              />
            </div>
            <div className="space-y-2">
              <Label>Type</Label>
              <Select
                value={formData.donationType}
                onValueChange={(val) => setFormData({ ...formData, donationType: val || 'Monetary' })}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Monetary">Monetary</SelectItem>
                  <SelectItem value="InKind">In-Kind</SelectItem>
                  <SelectItem value="Time">Time</SelectItem>
                  <SelectItem value="Skills">Skills</SelectItem>
                  <SelectItem value="SocialMedia">SocialMedia</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Amount</Label>
              <Input
                type="number"
                step="0.01"
                min="0"
                value={formData.amount}
                onChange={(e) => setFormData({ ...formData, amount: e.target.value })}
                disabled={formData.donationType !== 'Monetary'}
              />
            </div>
            <div className="space-y-2">
              <Label>Estimated Value</Label>
              <Input
                type="number"
                step="0.01"
                min="0"
                value={formData.estimatedValue}
                onChange={(e) => setFormData({ ...formData, estimatedValue: e.target.value })}
                disabled={formData.donationType === 'Monetary'}
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Campaign</Label>
              <Input
                value={formData.campaignName}
                onChange={(e) => setFormData({ ...formData, campaignName: e.target.value })}
              />
            </div>
            <div className="space-y-2">
              <Label>Channel</Label>
              <Select
                value={formData.channelSource}
                onValueChange={(val) => setFormData({ ...formData, channelSource: val || 'Online' })}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Online">Online</SelectItem>
                  <SelectItem value="Mail">Mail</SelectItem>
                  <SelectItem value="Event">Event</SelectItem>
                  <SelectItem value="InPerson">In-Person</SelectItem>
                  <SelectItem value="Unknown">Unknown</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <DialogFooter className="pt-4">
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Cancel
            </Button>
            <Button type="submit" disabled={loading}>
              {loading ? 'Saving...' : 'Save Changes'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
