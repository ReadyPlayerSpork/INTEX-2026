import { useEffect, useRef, useState } from 'react'
import { Link } from 'react-router-dom'
import { Button } from '@/components/ui/button'

const STORAGE_KEY = 'cookie-consent'

export function CookieConsent() {
  const [visible, setVisible] = useState(() => !localStorage.getItem(STORAGE_KEY))
  const acceptRef = useRef<HTMLButtonElement>(null)

  useEffect(() => {
    if (visible) {
      acceptRef.current?.focus()
      document.body.style.paddingBottom = '6rem'
    } else {
      document.body.style.paddingBottom = ''
    }
    return () => {
      document.body.style.paddingBottom = ''
    }
  }, [visible])

  const respond = (choice: 'accepted' | 'declined') => {
    localStorage.setItem(STORAGE_KEY, choice)
    setVisible(false)
  }

  if (!visible) return null

  return (
    <div
      role="region"
      aria-label="Cookie notice"
      className="bg-card/95 border-border fixed inset-x-0 bottom-0 z-50 mx-0 rounded-t-2xl border border-b-0 px-5 py-5 shadow-[0_-8px_40px_-12px_rgba(74,44,94,0.15)] backdrop-blur sm:bottom-4 sm:mx-auto sm:max-w-5xl sm:rounded-2xl sm:border-b"
    >
      <div className="flex flex-col items-start gap-3 sm:flex-row sm:items-center sm:justify-between">
        <p className="text-sm leading-6 text-pretty">
          We use essential cookies only for authentication and session
          management. No tracking or advertising cookies are used. You can
          change your preference at any time on our{' '}
          <Link
            to="/privacy"
            className="text-accent underline underline-offset-4 transition-colors hover:text-primary"
          >
            Privacy Policy
          </Link>{' '}
          page.
        </p>
        <div className="flex shrink-0 gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => respond('declined')}
          >
            Decline
          </Button>
          <Button
            ref={acceptRef}
            size="sm"
            onClick={() => respond('accepted')}
          >
            Accept
          </Button>
        </div>
      </div>
    </div>
  )
}

/** Allow other components (e.g. Privacy page) to reset cookie consent */
export function resetCookieConsent() {
  localStorage.removeItem(STORAGE_KEY)
}
