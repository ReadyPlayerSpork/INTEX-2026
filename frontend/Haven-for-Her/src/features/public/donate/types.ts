import type { FormEvent } from "react"

import type { DesignVariantId } from "@/features/public/designReview"

export interface AnonymousDonateVariantProps {
  variant: DesignVariantId
  amount: string
  campaign: string
  donorName: string
  donorEmail: string
  notes: string
  loading: boolean
  success: boolean
  error: string | null
  onAmountChange(value: string): void
  onCampaignChange(value: string): void
  onDonorNameChange(value: string): void
  onDonorEmailChange(value: string): void
  onNotesChange(value: string): void
  onPresetAmount(value: string): void
  onSubmit(event: FormEvent<HTMLFormElement>): void
}
