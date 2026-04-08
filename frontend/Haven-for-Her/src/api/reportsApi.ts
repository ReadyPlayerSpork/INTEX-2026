import { api } from './client'

export interface DonationTrend {
  year: number
  month: number
  monetaryTotal: number
  inKindTotal: number
  count: number
}

export interface EducationOutcome {
  safehouseId: number
  safehouseName: string
  avgProgressPercent: number
  avgAttendanceRate: number
  totalRecords: number
}

export interface HealthOutcome {
  safehouseId: number
  safehouseName: string
  avgGeneralHealthScore: number
  avgNutritionScore: number
  avgSleepQualityScore: number
  totalRecords: number
}

export interface ResidentOutcomes {
  educationBySafehouse: EducationOutcome[]
  healthBySafehouse: HealthOutcome[]
}

export interface SafehouseMetric {
  metricId: number
  safehouseId: number
  safehouseName: string
  monthStart: string
  monthEnd: string
  activeResidents: number
  avgEducationProgress: number
  avgHealthScore: number
  processRecordingCount: number
  homeVisitationCount: number
  incidentCount: number
}

export interface ReintegrationByType {
  reintegrationType: string
  total: number
  successful: number
  inProgress: number
  pending: number
}

export interface ReintegrationByStatus {
  status: string
  count: number
}

export interface ReintegrationData {
  byType: ReintegrationByType[]
  byStatus: ReintegrationByStatus[]
}

export interface AccomplishmentReport {
  year: number
  services: {
    counselingSessions: number
    individualSessions: number
    groupSessions: number
    homeVisitations: number
    interventions: number
    interventionsByCategory: Array<{ category: string; count: number }>
    incidents: number
    resolvedIncidents: number
  }
  beneficiaries: {
    totalResidents: number
    newAdmissions: number
    discharges: number
    reintegrationCompleted: number
    byCaseCategory: Array<{ category: string; count: number }>
  }
  donations: {
    totalDonations: number
    totalMonetaryValue: number
  }
}

export const reportsApi = {
  getDonationTrends(months = 12): Promise<DonationTrend[]> {
    return api.get(`/api/reports/donation-trends?months=${months}`)
  },

  getResidentOutcomes(): Promise<ResidentOutcomes> {
    return api.get('/api/reports/resident-outcomes')
  },

  getSafehouseComparison(months = 6): Promise<SafehouseMetric[]> {
    return api.get(`/api/reports/safehouse-comparison?months=${months}`)
  },

  getReintegration(): Promise<ReintegrationData> {
    return api.get('/api/reports/reintegration')
  },

  getAccomplishment(year?: number): Promise<AccomplishmentReport> {
    const qs = year ? `?year=${year}` : ''
    return api.get(`/api/reports/accomplishment${qs}`)
  },
}
