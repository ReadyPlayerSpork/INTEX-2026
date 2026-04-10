import { useEffect, useRef, useState } from 'react'
import { Link } from 'react-router-dom'
import { Button } from '@/components/ui/button'
import {
  dismissEssentialCookieNotice,
  isEssentialCookieNoticeDismissed,
} from '@/lib/essentialCookieNotice'

export function CookieConsent() {
  const [visible, setVisible] = useState(() => !isEssentialCookieNoticeDismissed())
  const dismissRef = useRef<HTMLButtonElement>(null)

  useEffect(() => {
    if (visible) {
      dismissRef.current?.focus()
      document.body.style.paddingBottom = '6rem'
    } else {
      document.body.style.paddingBottom = ''
    }
    return () => {
      document.body.style.paddingBottom = ''
    }
  }, [visible])

  const dismiss = () => {
    dismissEssentialCookieNotice()
    setVisible(false)
  }

  if (!visible) return null

  return (
    <div
      role="region"
      aria-label="Essential cookie notice"
      className="bg-card/95 border-border fixed inset-x-0 bottom-0 z-50 mx-0 rounded-t-2xl border border-b-0 px-5 py-5 shadow-[0_-8px_40px_-12px_rgba(74,44,94,0.15)] backdrop-blur sm:bottom-4 sm:mx-auto sm:max-w-5xl sm:rounded-2xl sm:border-b"
    >
      <div className="flex flex-col items-start gap-3 sm:flex-row sm:items-center sm:justify-between">
        <p className="text-sm leading-6 text-pretty">
          We use <strong>essential cookies only</strong> for authentication and
          session management when you sign in. They are required for that
          functionality and are not used for advertising or cross-site tracking.
          Read more in our{' '}
          <Link
            to="/privacy"
            className="text-accent underline underline-offset-4 transition-colors hover:text-primary"
          >
            Privacy Policy
          </Link>
          .
        </p>
        <div className="flex shrink-0">
          <Button ref={dismissRef} size="sm" onClick={dismiss}>
            Got it
          </Button>
        </div>
      </div>
    </div>
  )
}
