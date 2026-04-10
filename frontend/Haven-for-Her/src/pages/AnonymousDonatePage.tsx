import { Link } from 'react-router-dom'
import { buttonVariants } from '@/components/ui/button-variants'
import { cn } from '@/lib/utils'
import { Card, CardContent } from '@/components/ui/card'
import {
  formatCurrencyAmount,
  getCurrencyExampleTiers,
} from '@/features/public/donate/donationCurrencies'
import { useAnonymousDonateForm } from '@/features/public/donate/useAnonymousDonateForm'
import { SharedDonationForm } from '@/features/public/donate/SharedDonationForm'

export function AnonymousDonatePage() {
  const {
    currencyCode,
    onCurrencyChange,
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

  const exampleTiers = getCurrencyExampleTiers(currencyCode)

  if (success) {
    return (
      <div className="px-5 py-16 md:px-10 md:py-24">
        <Card className="mx-auto max-w-xl border-primary/20 bg-primary/7 text-center">
          <CardContent className="p-8">
            <h1 className="font-heading text-4xl font-semibold text-accent">
              Thank you
            </h1>
            <p className="text-muted-foreground mx-auto mt-4 max-w-md leading-7 text-pretty">
              Your generous donation has been recorded. If you provided an
              email, a receipt will be sent to you.
            </p>
            <Link
              to="/"
              className={cn(buttonVariants(), 'mt-6 inline-flex no-underline')}
            >
              Back to Home
            </Link>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="px-5 py-16 md:px-10 md:py-24">
      <div className="mx-auto grid max-w-6xl gap-8 lg:grid-cols-[0.95fr_1.05fr]">
        <div className="space-y-5">
          <p className="text-muted-foreground text-sm font-semibold tracking-[0.18em] uppercase">
            Anonymous giving
          </p>
          <h1 className="font-heading text-balance text-[clamp(2.5rem,5vw,4.1rem)] font-semibold text-accent">
            Give with as little friction as possible.
          </h1>
          <p className="text-muted-foreground max-w-lg leading-8 text-pretty">
            This donation flow is designed for speed and trust. No account is
            required. If you choose to share contact details, we will use them
            only for receipts and stewardship.
          </p>
          <Card className="border-primary/18 bg-primary/7">
            <CardContent className="grid gap-4 p-6">
              <div>
                <p className="font-semibold text-accent">Where your support goes</p>
                <p className="text-muted-foreground mt-2 text-sm leading-6">
                  Safe housing, trauma-informed counseling, education support,
                  health needs, and the practical care that helps healing feel
                  real.
                </p>
              </div>
              <div className="grid gap-3 sm:grid-cols-3">
                {exampleTiers.map((tier) => (
                  <div
                    key={tier.blurb}
                    className="rounded-2xl border border-border/60 bg-card/90 p-4"
                  >
                    <p className="font-heading text-primary text-2xl font-semibold">
                      {formatCurrencyAmount(currencyCode, tier.amount)}
                    </p>
                    <p className="text-muted-foreground mt-1 text-xs">
                      {tier.blurb}
                    </p>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>

        <Card className="border-border/70 bg-card/95">
          <CardContent className="p-8">
            <h2 className="font-heading text-3xl font-semibold text-accent">
              Make a donation
            </h2>
            <p className="text-muted-foreground mt-2 text-sm leading-6">
              No account required. Your donation goes directly to supporting
              survivors.
            </p>

            <SharedDonationForm
              currencyCode={currencyCode}
              onCurrencyChange={onCurrencyChange}
              amount={amount}
              onAmountChange={onAmountChange}
              campaign={campaign}
              onCampaignChange={onCampaignChange}
              notes={notes}
              onNotesChange={onNotesChange}
              loading={loading}
              error={error}
              onSubmit={onSubmit}
              showAnonymousDetails={true}
              donorName={donorName}
              onDonorNameChange={onDonorNameChange}
              donorEmail={donorEmail}
              onDonorEmailChange={onDonorEmailChange}
              submitLabel="Donate now"
            />

            <p className="text-muted-foreground mt-6 text-center text-xs">
              Have an account?{' '}
              <Link
                to="/login"
                className="text-accent font-semibold underline underline-offset-4"
              >
                Log in
              </Link>{' '}
              to track your giving history.
            </p>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
