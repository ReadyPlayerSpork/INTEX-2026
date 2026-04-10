import { useState, type FormEvent } from 'react'
import { Link } from 'react-router-dom'
import { donationApi, getDonationErrorMessage } from '@/api/donationApi'
import { buttonVariants } from '@/components/ui/button-variants'
import { cn } from '@/lib/utils'
import { Card, CardContent } from '@/components/ui/card'
import {
  type DonationCurrencyCode,
} from '@/features/public/donate/donationCurrencies'
import { SharedDonationForm } from '@/features/public/donate/SharedDonationForm'


export function DonatePage() {
  const [currencyCode, setCurrencyCode] =
    useState<DonationCurrencyCode>('USD')
  const [amount, setAmount] = useState('')
  const [campaign, setCampaign] = useState('')
  const [notes, setNotes] = useState('')
  const [isRecurring, setIsRecurring] = useState(false)
  const [submittedRecurring, setSubmittedRecurring] = useState(false)
  const [loading, setLoading] = useState(false)
  const [success, setSuccess] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault()
    setError(null)
    setLoading(true)

    try {
      await donationApi.submitDonation({
        amount,
        currencyCode,
        campaignName: campaign,
        notes,
        isRecurring,
      })
      setSubmittedRecurring(isRecurring)
      setSuccess(true)
    } catch (err) {
      setError(getDonationErrorMessage(err))
    } finally {
      setLoading(false)
    }
  }

  if (success) {
    return (
      <div className="px-5 py-16 md:px-10 md:py-24">
        <Card className="mx-auto max-w-xl border-primary/20 bg-primary/7 text-center">
          <CardContent className="p-8">
            <h1 className="font-heading text-4xl font-semibold text-accent">
              Thank you
            </h1>
            <p className="text-muted-foreground mx-auto mt-4 max-w-md leading-7 text-pretty">
              Your donation has been recorded. Your generosity makes a real
              difference in the lives of survivors.
              {submittedRecurring ? (
                <>
                  {' '}
                  We have noted your interest in recurring giving; our team may
                  contact you to arrange the details—this site does not charge
                  your card automatically.
                </>
              ) : null}
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
      <div className="mx-auto grid max-w-5xl gap-8 lg:grid-cols-[0.9fr_1.1fr]">
        <div className="space-y-5">
          <p className="text-muted-foreground text-sm font-semibold tracking-[0.18em] uppercase">
            Donor giving
          </p>
          <h1 className="font-heading text-balance text-[clamp(2.5rem,5vw,4rem)] font-semibold text-accent">
            Support survivors with a financial gift.
          </h1>
          <p className="text-muted-foreground max-w-lg leading-8 text-pretty">
            Every contribution helps fund safe housing, counseling, education
            support, and practical care for survivors. Choose the currency that
            works best for you.
          </p>
          <Card className="border-border/70 bg-card/95">
            <CardContent className="p-6">
              <p className="font-semibold text-accent">Donating as you</p>
              <p className="text-muted-foreground mt-2 text-sm leading-6">
                This donation will be linked to your account so you can track
                your giving history and receive tax receipts.
              </p>
            </CardContent>
          </Card>
        </div>

        <Card className="border-border/70 bg-card/95">
          <CardContent className="p-8">
            <h2 className="font-heading text-3xl font-semibold text-accent">
              Make a donation
            </h2>

            <SharedDonationForm
              currencyCode={currencyCode}
              onCurrencyChange={setCurrencyCode as (c: string) => void}
              amount={amount}
              onAmountChange={setAmount}
              campaign={campaign}
              onCampaignChange={setCampaign}
              notes={notes}
              onNotesChange={setNotes}
              loading={loading}
              error={error}
              onSubmit={handleSubmit}
              showRecurring={true}
              isRecurring={isRecurring}
              onRecurringChange={setIsRecurring}
              submitLabel="Donate"
            />
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
