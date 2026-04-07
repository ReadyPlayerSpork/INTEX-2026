import type { DesignVariantId } from "@/features/public/designReview"

export interface ImpactStats {
  totalResidentsServed: number
  activeResidents: number
  totalDonations: number
  totalDonationValuePhp: number
  activeSafehouses: number
  activePartners: number
}

export interface HomeVariantProps {
  variant: DesignVariantId
  stats: ImpactStats | null
  isLoading: boolean
}
