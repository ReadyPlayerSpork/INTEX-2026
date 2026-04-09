import { api } from './client'

export interface SessionDetailDto {
  recordingId: number
  residentId: number
  residentCode: string
  sessionDate: string
  socialWorker: string
  sessionType: string
  sessionDurationMinutes: number
  emotionalStateObserved: string
  emotionalStateEnd: string
  sessionNarrative: string
  interventionsApplied: string
  followUpActions: string
  progressNoted: boolean
  concernsFlagged: boolean
  referralMade: boolean
}

export interface UpdateSessionRequest {
  residentId: number
  sessionDate: string
  sessionType: string
  sessionDurationMinutes: number
  emotionalStateObserved: string
  emotionalStateEnd: string
  sessionNarrative: string
  interventionsApplied: string
  followUpActions: string
  progressNoted: boolean
  concernsFlagged: boolean
  referralMade: boolean
  socialWorker: string
}

export interface CaseConferenceDto {
  planId: number
  residentId: number
  residentCode: string
  planCategory: string
  planDescription: string
  servicesProvided: string
  status: string
  caseConferenceDate: string
  targetDate: string
  createdAt: string
}

export interface SessionsListResponse {
  totalCount: number
  page: number
  pageSize: number
  items: SessionDetailDto[]
}

export interface CaseConferencesResponse {
  totalCount: number
  page: number
  pageSize: number
  items: CaseConferenceDto[]
}

export const counselorApi = {
  getSession(recordingId: number): Promise<SessionDetailDto> {
    return api.get(`/api/counselor/sessions/${recordingId}`)
  },

  updateSession(recordingId: number, data: UpdateSessionRequest): Promise<{ message: string }> {
    return api.put(`/api/counselor/sessions/${recordingId}`, data)
  },

  deleteSession(recordingId: number): Promise<{ message: string }> {
    return api.delete(`/api/counselor/sessions/${recordingId}`)
  },

  updateVisitation(visitationId: number, data: unknown): Promise<{ message: string }> {
    return api.put(`/api/counselor/visitations/${visitationId}`, data)
  },

  deleteVisitation(visitationId: number): Promise<{ message: string }> {
    return api.delete(`/api/counselor/visitations/${visitationId}`)
  },

  getSessions(params?: {
    residentId?: number
    sessionType?: string
    dateFrom?: string
    dateTo?: string
    concernsOnly?: boolean
    page?: number
    pageSize?: number
  }): Promise<SessionsListResponse> {
    const qs = new URLSearchParams()
    if (params?.residentId) qs.set('residentId', String(params.residentId))
    if (params?.sessionType) qs.set('sessionType', params.sessionType)
    if (params?.dateFrom) qs.set('dateFrom', params.dateFrom)
    if (params?.dateTo) qs.set('dateTo', params.dateTo)
    if (params?.concernsOnly) qs.set('concernsOnly', 'true')
    if (params?.page) qs.set('page', String(params.page))
    if (params?.pageSize) qs.set('pageSize', String(params.pageSize))
    const query = qs.toString()
    return api.get(`/api/counselor/sessions${query ? `?${query}` : ''}`)
  },

  getVisitations(params?: {
    residentId?: number
    visitType?: string
    dateFrom?: string
    dateTo?: string
    page?: number
    pageSize?: number
  }) {
    const qs = new URLSearchParams()
    if (params?.residentId) qs.set('residentId', String(params.residentId))
    if (params?.visitType) qs.set('visitType', params.visitType)
    if (params?.dateFrom) qs.set('dateFrom', params.dateFrom)
    if (params?.dateTo) qs.set('dateTo', params.dateTo)
    if (params?.page) qs.set('page', String(params.page))
    if (params?.pageSize) qs.set('pageSize', String(params.pageSize))
    const query = qs.toString()
    return api.get(`/api/counselor/visitations${query ? `?${query}` : ''}`)
  },

  getCaseConferences(params?: {
    page?: number
    pageSize?: number
  }): Promise<CaseConferencesResponse> {
    const qs = new URLSearchParams()
    if (params?.page) qs.set('page', String(params.page))
    if (params?.pageSize) qs.set('pageSize', String(params.pageSize))
    const query = qs.toString()
    return api.get(`/api/counselor/case-conferences${query ? `?${query}` : ''}`)
  },
}
