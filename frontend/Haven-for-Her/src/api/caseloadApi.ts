import { api } from './client'

export interface CreateResidentRequest {
  caseControlNo: string
  internalCode: string
  safehouseId: number
  caseStatus: string
  sex: string
  dateOfBirth: string
  birthStatus: string
  placeOfBirth: string
  religion: string
  caseCategory: string
  subCatOrphaned: boolean
  subCatTrafficked: boolean
  subCatChildLabor: boolean
  subCatPhysicalAbuse: boolean
  subCatSexualAbuse: boolean
  subCatOsaec: boolean
  subCatCicl: boolean
  subCatAtRisk: boolean
  subCatStreetChild: boolean
  subCatChildWithHiv: boolean
  isPwd: boolean
  pwdType?: string | null
  hasSpecialNeeds: boolean
  specialNeedsDiagnosis?: string | null
  familyIs4ps: boolean
  familySoloParent: boolean
  familyIndigenous: boolean
  familyParentPwd: boolean
  familyInformalSettler: boolean
  dateOfAdmission: string
  ageUponAdmission?: string | null
  presentAge?: string | null
  lengthOfStay?: string | null
  referralSource: string
  referringAgencyPerson?: string | null
  assignedSocialWorker: string
  initialCaseAssessment?: string | null
  reintegrationType?: string | null
  reintegrationStatus?: string | null
  initialRiskLevel: string
  currentRiskLevel: string
  dateEnrolled: string
  notesRestricted?: string | null
}

export interface SafehouseOption {
  safehouseId: number
  name: string
}

export interface CascadeInfo {
  label: string
  count: number
}

export const caseloadApi = {
  createResident(data: CreateResidentRequest): Promise<{ message: string; residentId: number }> {
    return api.post('/api/caseload', data)
  },

  updateResident(id: number, data: CreateResidentRequest): Promise<{ message: string }> {
    return api.put(`/api/caseload/${id}`, data)
  },

  deleteResident(id: number): Promise<{ message: string }> {
    return api.delete(`/api/caseload/${id}`)
  },

  getCascadeInfo(id: number): Promise<CascadeInfo[]> {
    return api.get(`/api/caseload/${id}/cascade-info`)
  },

  getSafehouses(): Promise<{ items: SafehouseOption[] }> {
    return api.get('/api/admin/safehouses?pageSize=100')
  },
}
