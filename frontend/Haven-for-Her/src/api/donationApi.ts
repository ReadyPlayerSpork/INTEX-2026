import { ApiError, api } from './client'

export interface DonationResponse {
  message: string
  donationId: number
}

export interface SubmitDonationInput {
  amount: string
  currencyCode: string
  campaignName?: string
  notes?: string
  isRecurring?: boolean
}

export interface SubmitAnonymousDonationInput extends SubmitDonationInput {
  donorName?: string
  donorEmail?: string
}

export class DonationValidationError extends Error {
  constructor(message: string) {
    super(message)
    this.name = 'DonationValidationError'
  }
}

function trimToNull(value?: string | null): string | null {
  const trimmed = value?.trim()
  return trimmed ? trimmed : null
}

function normalizeCurrencyCode(value: string): string {
  const normalized = value.trim().toUpperCase()
  if (!normalized) {
    throw new DonationValidationError('Please choose a currency before donating.')
  }
  return normalized
}

function parseAmount(rawAmount: string): number {
  const parsed = Number.parseFloat(rawAmount)
  if (!Number.isFinite(parsed) || parsed <= 0) {
    throw new DonationValidationError(
      'Please enter a valid donation amount greater than 0.',
    )
  }
  return parsed
}

function readApiMessage(body: unknown): string | null {
  if (!body || typeof body !== 'object') return null

  const maybeMessage = (body as { message?: unknown }).message
  if (typeof maybeMessage === 'string' && maybeMessage.trim()) {
    return maybeMessage
  }

  const maybeDetail = (body as { detail?: unknown }).detail
  if (typeof maybeDetail === 'string' && maybeDetail.trim()) {
    return maybeDetail
  }

  const maybeTitle = (body as { title?: unknown }).title
  if (typeof maybeTitle === 'string' && maybeTitle.trim()) {
    return maybeTitle
  }

  return null
}

export function getDonationErrorMessage(error: unknown): string {
  if (error instanceof DonationValidationError) {
    return error.message
  }

  if (error instanceof ApiError) {
    if (error.status === 400) {
      return (
        readApiMessage(error.body) ??
        'Please review the donation details and try again.'
      )
    }

    if (error.status === 401 || error.status === 403) {
      return 'Please sign in again before submitting your donation.'
    }

    if (error.status === 405) {
      return 'The donation endpoint is unavailable in this environment. Check that the frontend is pointed at the backend API.'
    }

    if (error.status >= 500) {
      return 'Unable to record your donation right now. Please try again later.'
    }

    return readApiMessage(error.body) ?? error.message
  }

  return 'An unexpected error occurred.'
}

export const donationApi = {
  submitDonation(input: SubmitDonationInput): Promise<DonationResponse> {
    return api.post('/api/donations', {
      amount: parseAmount(input.amount),
      currencyCode: normalizeCurrencyCode(input.currencyCode),
      campaignName: trimToNull(input.campaignName),
      notes: trimToNull(input.notes),
      isRecurring: input.isRecurring ?? false,
    })
  },

  submitAnonymousDonation(
    input: SubmitAnonymousDonationInput,
  ): Promise<DonationResponse> {
    return api.post('/api/donations/anonymous', {
      amount: parseAmount(input.amount),
      currencyCode: normalizeCurrencyCode(input.currencyCode),
      campaignName: trimToNull(input.campaignName),
      donorName: trimToNull(input.donorName),
      donorEmail: trimToNull(input.donorEmail),
      notes: trimToNull(input.notes),
    })
  },
}
