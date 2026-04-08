import { useEffect, useRef, useState } from 'react'
import { Link } from 'react-router-dom'
import { Button } from '@/components/ui/button'

const STORAGE_KEY = 'cookie-consent-accepted'

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

  const accept = () => {
    localStorage.setItem(STORAGE_KEY, 'true')
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
          We use essential cookies for authentication and session management.{' '}
          <Link
            to="/privacy"
            className="text-accent underline underline-offset-4 transition-colors hover:text-primary"
          >
            Privacy Policy
          </Link>
        </p>
        <Button ref={acceptRef} size="sm" onClick={accept}>
          Accept
        </Button>
      </div>
    </div>
  )
}
