/** localStorage key for essential-cookie banner dismissed (Model A). */
export const ESSENTIAL_COOKIE_NOTICE_KEY = 'essential-cookie-notice-dismissed'
const LEGACY_STORAGE_KEY = 'cookie-consent'

export function isEssentialCookieNoticeDismissed(): boolean {
  if (localStorage.getItem(ESSENTIAL_COOKIE_NOTICE_KEY) === '1') return true
  if (localStorage.getItem(LEGACY_STORAGE_KEY)) {
    localStorage.removeItem(LEGACY_STORAGE_KEY)
    localStorage.setItem(ESSENTIAL_COOKIE_NOTICE_KEY, '1')
    return true
  }
  return false
}

export function dismissEssentialCookieNotice(): void {
  localStorage.setItem(ESSENTIAL_COOKIE_NOTICE_KEY, '1')
}

/** Reset so the essential-cookie notice appears again (e.g. from Privacy page). */
export function resetEssentialCookieNotice(): void {
  localStorage.removeItem(ESSENTIAL_COOKIE_NOTICE_KEY)
  localStorage.removeItem(LEGACY_STORAGE_KEY)
}
