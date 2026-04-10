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
import { motion, useReducedMotion } from 'framer-motion'
import { ScrollReveal } from '@/components/ui/scroll-reveal'


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

  const shouldReduce = useReducedMotion()

  if (success) {
    return (
      <div className="px-5 py-16 md:px-10 md:py-24">
        <motion.div
          initial={shouldReduce ? false : { opacity: 0, scale: 0.92 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.6, ease: [0.33, 1, 0.68, 1] }}
          className="relative mx-auto max-w-xl"
        >
          <motion.div
            initial={shouldReduce ? false : { opacity: 0, scale: 0.5 }}
            animate={{ opacity: [0, 0.4, 0], scale: [0.5, 1.4, 1.8] }}
            transition={{ duration: 1.4, ease: 'easeOut' }}
            className="pointer-events-none absolute inset-0 rounded-2xl bg-primary/15 blur-xl"
          />
        <Card className="relative border-primary/20 bg-primary/7 text-center">
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
        </motion.div>
      </div>
    )
  }

  return (
    <div className="px-5 py-16 md:px-10 md:py-24">
      <div className="mx-auto grid max-w-5xl gap-8 lg:grid-cols-[0.9fr_1.1fr]">
        <ScrollReveal>
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
        </ScrollReveal>

        <ScrollReveal direction="right" delay={0.15}>
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
        </ScrollReveal>
      </div>
    </div>
  )
}
