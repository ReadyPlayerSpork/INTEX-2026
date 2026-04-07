export interface ImpactStats {
  totalResidentsServed: number
  activeResidents: number
  totalDonations: number
  totalDonationValuePhp: number
  activeSafehouses: number
  activePartners: number
  latestSnapshot: {
    headline: string
    summaryText: string
    publishedAt: string
  } | null
}
