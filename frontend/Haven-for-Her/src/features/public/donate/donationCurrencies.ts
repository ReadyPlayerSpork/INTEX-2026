export type DonationCurrencyCode = 'USD' | 'PHP' | 'EUR' | 'GBP' | 'CAD'

export const DONATION_CURRENCIES: {
  code: DonationCurrencyCode
  label: string
}[] = [
  { code: 'USD', label: 'US Dollar (USD)' },
  { code: 'PHP', label: 'Philippine Peso (PHP)' },
  { code: 'EUR', label: 'Euro (EUR)' },
  { code: 'GBP', label: 'British Pound (GBP)' },
  { code: 'CAD', label: 'Canadian Dollar (CAD)' },
]

const EXAMPLE_TIERS: Record<
  DonationCurrencyCode,
  { amount: number; blurb: string }[]
> = {
  USD: [
    { amount: 25, blurb: 'daily essentials' },
    { amount: 75, blurb: 'counseling support' },
    { amount: 250, blurb: 'education & care' },
  ],
  PHP: [
    { amount: 500, blurb: 'daily essentials' },
    { amount: 1500, blurb: 'counseling support' },
    { amount: 5000, blurb: 'education & care' },
  ],
  EUR: [
    { amount: 25, blurb: 'daily essentials' },
    { amount: 75, blurb: 'counseling support' },
    { amount: 250, blurb: 'education & care' },
  ],
  GBP: [
    { amount: 20, blurb: 'daily essentials' },
    { amount: 60, blurb: 'counseling support' },
    { amount: 200, blurb: 'education & care' },
  ],
  CAD: [
    { amount: 35, blurb: 'daily essentials' },
    { amount: 100, blurb: 'counseling support' },
    { amount: 325, blurb: 'education & care' },
  ],
}

export function getCurrencyExampleTiers(code: DonationCurrencyCode) {
  return EXAMPLE_TIERS[code]
}

export function formatExampleTierAmount(
  code: DonationCurrencyCode,
  amount: number,
): string {
  switch (code) {
    case 'USD':
      return `$${amount.toLocaleString('en-US')}`
    case 'PHP':
      return `PHP ${amount.toLocaleString('en-PH')}`
    case 'EUR':
      return `€${amount.toLocaleString('de-DE')}`
    case 'GBP':
      return `£${amount.toLocaleString('en-GB')}`
    case 'CAD':
      return `CA$${amount.toLocaleString('en-CA')}`
  }
}

export function isDonationCurrencyCode(
  value: string,
): value is DonationCurrencyCode {
  return DONATION_CURRENCIES.some((c) => c.code === value)
}

/** Format a currency amount for dashboards and tables; unknown ISO codes fall back to `CODE n`. */
export function formatCurrencyAmount(code: string, amount: number): string {
  const c = code.trim().toUpperCase()
  if (isDonationCurrencyCode(c)) return formatExampleTierAmount(c, amount)
  return `${c} ${amount.toLocaleString('en-US', { maximumFractionDigits: 2 })}`
}
