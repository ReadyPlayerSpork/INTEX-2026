import type { FormEvent } from "react"

import type { DesignVariantId } from "@/features/public/designReview"

export interface LoginVariantProps {
  variant: DesignVariantId
  email: string
  password: string
  error: string | null
  loading: boolean
  onEmailChange(value: string): void
  onPasswordChange(value: string): void
  onSubmit(event: FormEvent<HTMLFormElement>): void
}
