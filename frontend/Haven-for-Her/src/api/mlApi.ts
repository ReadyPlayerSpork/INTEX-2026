import { api } from './client'

// -- Donor Churn --

export interface ChurnPrediction {
  supporter_id: number
  display_name: string
  churn_probability: number
  risk_level: 'Low' | 'Medium' | 'High'
}

export interface ChurnPredictionDetail extends ChurnPrediction {
  top_factors: Record<string, number>
}

export async function getDonorChurn(supporterId: number): Promise<ChurnPredictionDetail> {
  return api.get(`/api/ml/donor-churn?supporter_id=${supporterId}`)
}

export async function getDonorChurnBatch(): Promise<ChurnPrediction[]> {
  return api.get('/api/ml/donor-churn/batch')
}

// -- Incident Risk --

export interface IncidentRiskPrediction {
  resident_id: number
  escalation_probability: number
  risk_level: 'Low' | 'Medium' | 'High'
  risk_factors: Record<string, number>
}

export interface IncidentRiskAlert {
  resident_id: number
  first_name: string
  last_name: string
  escalation_probability: number
  risk_level: 'Low' | 'Medium' | 'High'
  current_risk_level: string
}

export async function getIncidentRisk(residentId: number): Promise<IncidentRiskPrediction> {
  return api.get(`/api/ml/incident-risk?resident_id=${residentId}`)
}

export async function getResidentAlerts(): Promise<IncidentRiskAlert[]> {
  return api.get('/api/ml/incident-risk/alerts')
}

// -- Resident Progress --

export interface ResidentProgressPrediction {
  resident_id: number
  readiness_score: number
  risk_level: 'Low' | 'Medium' | 'High'
  top_factors: Record<string, number>
}

export async function getResidentProgress(residentId: number): Promise<ResidentProgressPrediction> {
  return api.get(`/api/ml/resident-progress?resident_id=${residentId}`)
}

// -- Safehouse Outcomes --

export interface SafehouseOutcome {
  safehouse_id: number
  safehouse_name: string
  predicted_education_progress: number
  actual_education_progress: number
}

export async function getSafehouseOutcomes(): Promise<SafehouseOutcome[]> {
  return api.get('/api/ml/safehouse-outcomes')
}

// -- Social Media --

export interface SocialMediaRecommendations {
  best_post_hour: number
  best_day_of_week: string
  best_post_type_for_donations: string
  best_media_type_for_engagement: string
  recommended_cta: string
  avg_engagement_rate: number
  total_donation_referrals: number
}

export interface SocialMediaPostData {
  platform: string
  post_type: string
  media_type: string
  time_of_day: string
  sentiment_tone: string
  caption_length: number
  num_hashtags: number
  is_boosted: boolean
}

export interface SocialMediaPrediction {
  donation_driver_probability: number
  predicted_donation_driver: boolean
  recommendation: string
}

export async function getSocialMediaRecommendations(): Promise<SocialMediaRecommendations> {
  return api.get('/api/ml/social-media/recommendations')
}

export async function predictSocialMediaPost(data: SocialMediaPostData): Promise<SocialMediaPrediction> {
  return api.post('/api/ml/social-media/predict', data)
}
