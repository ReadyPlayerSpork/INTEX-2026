import { api } from './client'

// -- Donor Churn --

export interface ChurnPrediction {
  supporterId: number
  displayName: string
  churnProbability: number
  riskLevel: 'Low' | 'Medium' | 'High'
}

export interface ChurnPredictionDetail extends ChurnPrediction {
  topFactors: Record<string, number>
}

export async function getDonorChurn(supporterId: number): Promise<ChurnPredictionDetail> {
  return api.get(`/api/ml/donor-churn?supporter_id=${supporterId}`)
}

export async function getDonorChurnBatch(): Promise<ChurnPrediction[]> {
  return api.get('/api/ml/donor-churn/batch')
}

// -- Incident Risk --

export interface IncidentRiskPrediction {
  residentId: number
  escalationProbability: number
  riskLevel: 'Low' | 'Medium' | 'High'
  riskFactors: Record<string, number>
}

export interface IncidentRiskAlert {
  residentId: number
  internalCode: string
  escalationProbability: number
  riskLevel: 'Low' | 'Medium' | 'High'
  currentRiskLevel: string
}

export async function getIncidentRisk(residentId: number): Promise<IncidentRiskPrediction> {
  return api.get(`/api/ml/incident-risk?resident_id=${residentId}`)
}

export async function getResidentAlerts(): Promise<IncidentRiskAlert[]> {
  return api.get('/api/ml/incident-risk/alerts')
}

// -- Resident Progress --

export interface ResidentProgressPrediction {
  residentId: number
  readinessScore: number
  riskLevel: 'Low' | 'Medium' | 'High'
  topFactors: Record<string, number>
}

export async function getResidentProgress(residentId: number): Promise<ResidentProgressPrediction> {
  return api.get(`/api/ml/resident-progress?resident_id=${residentId}`)
}

// -- Safehouse Outcomes --

export interface SafehouseOutcome {
  safehouseId: number
  safehouseName: string
  predictedEducationProgress: number
  actualEducationProgress: number
}

export async function getSafehouseOutcomes(): Promise<SafehouseOutcome[]> {
  return api.get('/api/ml/safehouse-outcomes')
}

// -- Social Media --

export interface SocialMediaRecommendations {
  bestPostHour: number
  bestDayOfWeek: string
  bestPostTypeForDonations: string
  bestMediaTypeForEngagement: string
  recommendedCta: string
  /** Human-readable label when `recommendedCta` is a Meta code (e.g. DONATE_NOW). */
  recommendedCtaLabel?: string
  avgEngagementRate: number
  totalDonationReferrals: number
  /** Share of historical posts that recorded at least one donation referral (0–1). */
  historicalDonationDriverRate?: number
}

export interface SocialMediaPostData {
  platform: string
  postType: string
  mediaType: string
  timeOfDay: string
  sentimentTone: string
  captionLength: number
  numHashtags: number
  isBoosted: boolean
}

export interface SocialMediaPrediction {
  donationDriverProbability: number
  predictedDonationDriver: boolean
  recommendation: string
  /** True when copy was too short for a meaningful model comparison. */
  contentInsufficient?: boolean
}

export async function getSocialMediaRecommendations(): Promise<SocialMediaRecommendations> {
  return api.get('/api/ml/social-media/recommendations')
}

export async function predictSocialMediaPost(data: SocialMediaPostData): Promise<SocialMediaPrediction> {
  return api.post('/api/ml/social-media/predict', data)
}

// -- Admin --

export async function retrainModels(): Promise<{ status: string; message: string; timestamp: string }> {
  return api.post('/api/ml/retrain')
}

export interface MLStatus {
  status: string
  lastTrained: string
  models: Record<string, {
    trainedAt: string
    rocAuc?: number
    r2?: number
    testSamples: number
  }>
}

export async function getMLStatus(): Promise<MLStatus> {
  return api.get('/api/ml/status')
}
