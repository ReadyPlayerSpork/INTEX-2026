export const donateSelectClassName =
  'border-input bg-background focus-visible:border-ring focus-visible:ring-ring/18 w-full rounded-lg border px-3 py-2 text-sm outline-none transition-[border-color,box-shadow] focus-visible:ring-4'

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

const CURRENCY_CODES = new Set<string>(DONATION_CURRENCIES.map((c) => c.code))

export function isDonationCurrencyCode(
  value: string,
): value is DonationCurrencyCode {
  return CURRENCY_CODES.has(value)
}

/** Format a currency amount; known ISO codes use Intl, unknown fall back to `CODE n`. */
export function formatCurrencyAmount(code: string, amount: number): string {
  const c = code.trim().toUpperCase()
  try {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: c,
      maximumFractionDigits: 0,
    }).format(amount)
  } catch {
    return `${c} ${amount.toLocaleString('en-US', { maximumFractionDigits: 2 })}`
  }
}
