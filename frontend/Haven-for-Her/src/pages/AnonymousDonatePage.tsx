import { Link } from 'react-router-dom'
import { Button } from '@/components/ui/button'
import { useAnonymousDonateForm } from '@/features/public/donate/useAnonymousDonateForm'

export function AnonymousDonatePage() {
  const {
    amount,
    campaign,
    donorName,
    donorEmail,
    notes,
    loading,
    success,
    error,
    onAmountChange,
    onCampaignChange,
    onDonorNameChange,
    onDonorEmailChange,
    onNotesChange,
    onSubmit,
  } = useAnonymousDonateForm()

  if (success) {
    return (
      <div className="mx-auto max-w-md px-4 py-16 text-center">
        <h1 className="mb-4 text-2xl font-bold">Thank you!</h1>
        <p className="text-muted-foreground mb-6">
          Your generous donation has been recorded. If you provided an email, a
          receipt will be sent to you.
        </p>
        <Link to="/">
          <Button>Back to Home</Button>
        </Link>
      </div>
    )
  }

  return (
    <div className="mx-auto max-w-md px-4 py-12">
      <h1 className="mb-2 text-2xl font-bold">Donate</h1>
      <p className="text-muted-foreground mb-8 text-sm">
        No account required. Your donation goes directly to supporting
        survivors.
      </p>

      {error && (
        <div className="bg-destructive/10 text-destructive mb-4 rounded-md p-3 text-sm">
          {error}
        </div>
      )}

      <form onSubmit={onSubmit} className="flex flex-col gap-4">
        <label className="flex flex-col gap-1">
          <span className="text-sm font-medium">Amount (PHP)</span>
          <input
            type="number"
            required
            min="1"
            step="0.01"
            value={amount}
            onChange={(e) => onAmountChange(e.target.value)}
            className="border-input bg-background rounded-md border px-3 py-2 text-sm"
            placeholder="0.00"
          />
        </label>

        <label className="flex flex-col gap-1">
          <span className="text-sm font-medium">Campaign (optional)</span>
          <input
            type="text"
            value={campaign}
            onChange={(e) => onCampaignChange(e.target.value)}
            className="border-input bg-background rounded-md border px-3 py-2 text-sm"
            placeholder="e.g. Holiday Giving 2026"
          />
        </label>

        <label className="flex flex-col gap-1">
          <span className="text-muted-foreground text-sm">
            Your name (optional, for receipt)
          </span>
          <input
            type="text"
            value={donorName}
            onChange={(e) => onDonorNameChange(e.target.value)}
            className="border-input bg-background rounded-md border px-3 py-2 text-sm"
          />
        </label>

        <label className="flex flex-col gap-1">
          <span className="text-muted-foreground text-sm">
            Your email (optional, for receipt)
          </span>
          <input
            type="email"
            value={donorEmail}
            onChange={(e) => onDonorEmailChange(e.target.value)}
            className="border-input bg-background rounded-md border px-3 py-2 text-sm"
          />
        </label>

        <label className="flex flex-col gap-1">
          <span className="text-muted-foreground text-sm">
            Notes (optional)
          </span>
          <textarea
            value={notes}
            onChange={(e) => onNotesChange(e.target.value)}
            className="border-input bg-background rounded-md border px-3 py-2 text-sm"
            rows={2}
          />
        </label>

        <Button type="submit" disabled={loading}>
          {loading ? 'Processing...' : 'Donate now'}
        </Button>
      </form>

      <p className="text-muted-foreground mt-6 text-center text-xs">
        Have an account?{' '}
        <Link to="/login" className="underline">
          Log in
        </Link>{' '}
        to track your giving history.
      </p>
    </div>
  )
}
