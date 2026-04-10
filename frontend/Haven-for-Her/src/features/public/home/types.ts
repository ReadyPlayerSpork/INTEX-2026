export interface LiveProgramOutcomes {
  /** Average of latest general health score per active resident (same signals as resident-progress ML features). */
  avgGeneralHealthScore: number | null
  /** Average of latest education progress % per active resident with records. */
  avgEducationProgressPercent: number | null
  residentsInHealthSample: number
  residentsInEducationSample: number
}

export interface DonationImpactEstimate {
  /** Illustrative weekly program pool per resident (USD), from recent giving. */
  estimatedWeeklySupportPerResidentUsd: number | null
  /** True when trailing-12-month USD was used; false when all-time USD fallback. */
  basedOnTrailingTwelveMonths: boolean
  sampleGiftUsd: number
  /** Approx. % of one resident-week covered by sampleGiftUsd (capped at 100). */
  sampleGiftWeekCoveragePercent: number | null
}

export interface ImpactStats {
  totalResidentsServed: number
  activeResidents: number
  totalDonations: number
  totalDonationValueUsd: number
  activeSafehouses: number
  activePartners: number
  /** Aggregates from operational data (preferred over static snapshot text when present). */
  liveProgramOutcomes: LiveProgramOutcomes | null
  /** Illustrative donor-impact framing (not audited financial reporting). */
  donationImpact: DonationImpactEstimate | null
  latestSnapshot: {
    headline: string
    summaryText: string
    /** Human-readable summary; may be synthesized from live DB metrics. */
    displaySummaryText?: string | null
    publishedAt: string
    /** Optional JSON string from published impact reports (shape varies by snapshot). */
    metricPayloadJson?: string | null
  } | null
}
