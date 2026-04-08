import { api } from './client'

export interface SupporterDto {
  supporterId: number
  supporterType: string
  displayName: string
  organizationName: string | null
  firstName: string | null
  lastName: string | null
  relationshipType: string
  region: string
  country: string
  email: string
  phone: string
  status: string
  firstDonationDate: string | null
  acquisitionChannel: string
  createdAt: string
}

export interface SupporterDetailDto extends SupporterDto {
  donations: DonationWithAllocations[]
}

export interface DonationWithAllocations {
  donationId: number
  donationType: string
  donationDate: string
  amount: number | null
  estimatedValue: number | null
  currencyCode: string | null
  campaignName: string | null
  channelSource: string
  isRecurring: boolean
  notes: string | null
  allocations: AllocationDto[]
}

export interface AllocationDto {
  allocationId: number
  safehouseId: number
  safehouseName: string
  programArea: string
  amountAllocated: number
  allocationDate: string
}

export interface AllocationSummary {
  safehouseId: number
  safehouseName: string
  total: number
  count: number
}

export interface ProgramAreaSummary {
  programArea: string
  total: number
  count: number
}

export interface AllocationsResponse {
  totalCount: number
  page: number
  pageSize: number
  items: Array<AllocationDto & { donationId: number; donationType: string; donorId: number }>
  bySafehouse: AllocationSummary[]
  byProgramArea: ProgramAreaSummary[]
}

export interface MonthlyTrend {
  year: number
  month: number
  monetaryTotal: number
  inKindTotal: number
  donationCount: number
  uniqueDonors: number
}

export interface CreateSupporterRequest {
  supporterType: string
  displayName: string
  organizationName?: string | null
  firstName?: string | null
  lastName?: string | null
  relationshipType: string
  region: string
  country: string
  email: string
  phone: string
  status: string
  acquisitionChannel: string
}

export interface RecordDonationRequest {
  supporterId: number
  donationType: string
  donationDate: string
  channelSource: string
  currencyCode?: string
  amount?: number | null
  estimatedValue?: number | null
  isRecurring: boolean
  campaignName?: string | null
  notes?: string | null
}

export const financialApi = {
  getSupporter(id: number): Promise<SupporterDetailDto> {
    return api.get(`/api/financial/management/donors/${id}`)
  },

  createSupporter(data: CreateSupporterRequest): Promise<{ message: string; supporterId: number }> {
    return api.post('/api/financial/management/donors', data)
  },

  updateSupporter(id: number, data: CreateSupporterRequest): Promise<{ message: string }> {
    return api.put(`/api/financial/management/donors/${id}`, data)
  },

  recordDonation(data: RecordDonationRequest): Promise<{ message: string; donationId: number }> {
    return api.post('/api/financial/management/donations', data)
  },

  getAllocations(params?: {
    safehouseId?: number
    programArea?: string
    from?: string
    to?: string
    page?: number
    pageSize?: number
  }): Promise<AllocationsResponse> {
    const qs = new URLSearchParams()
    if (params?.safehouseId) qs.set('safehouseId', String(params.safehouseId))
    if (params?.programArea) qs.set('programArea', params.programArea)
    if (params?.from) qs.set('from', params.from)
    if (params?.to) qs.set('to', params.to)
    if (params?.page) qs.set('page', String(params.page))
    if (params?.pageSize) qs.set('pageSize', String(params.pageSize))
    const query = qs.toString()
    return api.get(`/api/financial/management/allocations${query ? `?${query}` : ''}`)
  },

  getTrends(months = 12): Promise<MonthlyTrend[]> {
    return api.get(`/api/financial/management/trends?months=${months}`)
  },
}
