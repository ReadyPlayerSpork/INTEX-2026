export interface ImpactStats {
  totalResidentsServed: number
  activeResidents: number
  totalDonations: number
  totalDonationValueUsd: number
  activeSafehouses: number
  activePartners: number
  latestSnapshot: {
    headline: string
    summaryText: string
    publishedAt: string
    /** Optional JSON string from published impact reports (shape varies by snapshot). */
    metricPayloadJson?: string | null
  } | null
}
