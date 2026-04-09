import { type FormEvent } from 'react'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Button } from '@/components/ui/button'
import {
  DONATION_CURRENCIES,
  donateSelectClassName,
  isDonationCurrencyCode,
} from '@/features/public/donate/donationCurrencies'

interface SharedDonationFormProps {
  currencyCode: string
  onCurrencyChange: (code: string) => void
  amount: string
  onAmountChange: (val: string) => void
  campaign: string
  onCampaignChange: (val: string) => void
  notes: string
  onNotesChange: (val: string) => void

  loading: boolean
  error: string | null
  onSubmit: (e: FormEvent<HTMLFormElement>) => void

  // Authenticated specific
  showRecurring?: boolean
  isRecurring?: boolean
  onRecurringChange?: (val: boolean) => void

  // Anonymous specific
  showAnonymousDetails?: boolean
  donorName?: string
  onDonorNameChange?: (val: string) => void
  donorEmail?: string
  onDonorEmailChange?: (val: string) => void

  submitLabel?: string
}

const checkboxClassName =
  'border-input bg-background focus-visible:border-ring focus-visible:ring-ring/18 mt-0.5 size-4 shrink-0 rounded border text-primary outline-none transition-[border-color,box-shadow] focus-visible:ring-4'

export function SharedDonationForm({
  currencyCode,
  onCurrencyChange,
  amount,
  onAmountChange,
  campaign,
  onCampaignChange,
  notes,
  onNotesChange,
  loading,
  error,
  onSubmit,
  showRecurring,
  isRecurring,
  onRecurringChange,
  showAnonymousDetails,
  donorName,
  onDonorNameChange,
  donorEmail,
  onDonorEmailChange,
  submitLabel = 'Donate',
}: SharedDonationFormProps) {
  return (
    <>
      {error && (
        <div
          role="alert"
          className="bg-destructive/10 text-destructive mt-6 rounded-2xl border border-destructive/20 p-3 text-sm"
        >
          {error}
        </div>
      )}

      <form onSubmit={onSubmit} className="mt-6 flex flex-col gap-4">
        <label className="flex flex-col gap-2">
          <span className="text-sm font-semibold">Currency</span>
          <select
            value={currencyCode}
            onChange={(e) => {
              const v = e.target.value
              if (isDonationCurrencyCode(v)) onCurrencyChange(v)
            }}
            className={donateSelectClassName}
          >
            {DONATION_CURRENCIES.map((c) => (
              <option key={c.code} value={c.code}>
                {c.label}
              </option>
            ))}
          </select>
        </label>

        <label className="flex flex-col gap-2">
          <span className="text-sm font-semibold">
            Amount ({currencyCode})
          </span>
          <Input
            type="number"
            required
            min="1"
            step="0.01"
            value={amount}
            onChange={(e) => onAmountChange(e.target.value)}
            placeholder="0.00"
          />
        </label>

        {showRecurring && (
          <label className="flex cursor-pointer gap-3 rounded-xl border border-border/40 bg-card/40 p-4 motion-safe:transition-colors motion-safe:duration-200 hover:bg-card/70 has-[:focus-visible]:border-ring/50">
            <input
              type="checkbox"
              checked={isRecurring}
              onChange={(e) => onRecurringChange?.(e.target.checked)}
              className={checkboxClassName}
              aria-describedby="donate-recurring-hint"
            />
            <span className="flex min-w-0 flex-col gap-1.5 text-left">
              <span className="text-sm font-semibold">
                Make this a recurring gift
              </span>
              <span
                id="donate-recurring-hint"
                className="text-muted-foreground text-xs leading-relaxed"
              >
                We will record your preference so staff can follow up to set
                up ongoing support. No payment is processed automatically
                here.
              </span>
            </span>
          </label>
        )}

        <label className="flex flex-col gap-2">
          <span className="text-sm font-semibold">Campaign (optional)</span>
          <Input
            type="text"
            value={campaign}
            onChange={(e) => onCampaignChange(e.target.value)}
            placeholder="e.g. Holiday Giving 2026"
          />
        </label>

        {showAnonymousDetails && (
          <>
            <label className="flex flex-col gap-2">
              <span className="text-muted-foreground text-sm">
                Your name (optional, for receipt)
              </span>
              <Input
                type="text"
                value={donorName}
                onChange={(e) => onDonorNameChange?.(e.target.value)}
              />
            </label>

            <label className="flex flex-col gap-2">
              <span className="text-muted-foreground text-sm">
                Your email (optional, for receipt)
              </span>
              <Input
                type="email"
                value={donorEmail}
                onChange={(e) => onDonorEmailChange?.(e.target.value)}
              />
            </label>
          </>
        )}

        <label className="flex flex-col gap-2">
          <span
            className={
              showAnonymousDetails
                ? 'text-muted-foreground text-sm'
                : 'text-sm font-semibold'
            }
          >
            Notes (optional)
          </span>
          <Textarea
            value={notes}
            onChange={(e) => onNotesChange(e.target.value)}
            rows={3}
          />
        </label>

        <Button type="submit" disabled={loading} className="mt-2">
          {loading ? 'Processing...' : submitLabel}
        </Button>
      </form>
    </>
  )
}
