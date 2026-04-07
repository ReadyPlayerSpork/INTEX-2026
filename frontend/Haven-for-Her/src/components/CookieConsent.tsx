import { useState } from 'react'
import { Link } from 'react-router-dom'
import { Button } from '@/components/ui/button'

const STORAGE_KEY = 'cookie-consent-accepted'

export function CookieConsent() {
  const [visible, setVisible] = useState(() => !localStorage.getItem(STORAGE_KEY))

  const accept = () => {
    localStorage.setItem(STORAGE_KEY, 'true')
    setVisible(false)
  }

  if (!visible) return null

  return (
    <div className="bg-card border-border fixed inset-x-0 bottom-0 z-50 border-t p-4 shadow-lg">
      <div className="mx-auto flex max-w-7xl flex-col items-center gap-3 sm:flex-row sm:justify-between">
        <p className="text-sm">
          We use essential cookies for authentication and session management.{' '}
          <Link to="/privacy" className="underline">
            Privacy Policy
          </Link>
        </p>
        <Button size="sm" onClick={accept}>
          Accept
        </Button>
      </div>
    </div>
  )
}
