import { useCallback, useEffect, useState, type FormEvent } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { authApi } from '@/api/authApi'
import { ApiError } from '@/api/client'

type View = 'loading' | 'disabled' | 'setup' | 'enabled'

export function SecuritySettingsPage() {
  const [view, setView] = useState<View>('loading')
  const [sharedKey, setSharedKey] = useState('')
  const [qrUri, setQrUri] = useState('')
  const [code, setCode] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState<string | null>(null)
  const [busy, setBusy] = useState(false)

  const loadStatus = useCallback(async () => {
    try {
      const { isEnabled } = await authApi.twoFactorStatus()
      setView(isEnabled ? 'enabled' : 'disabled')
    } catch {
      setError('Unable to load 2FA status.')
    }
  }, [])

  useEffect(() => {
    loadStatus()
  }, [loadStatus])

  const handleBeginSetup = async () => {
    setError(null)
    setSuccess(null)
    setBusy(true)
    try {
      const { sharedKey: key, authenticatorUri } = await authApi.twoFactorSetup()
      setSharedKey(key)
      setQrUri(authenticatorUri)
      setView('setup')
    } catch (err) {
      setError(
        err instanceof ApiError ? err.message : 'Failed to start 2FA setup.',
      )
    } finally {
      setBusy(false)
    }
  }

  const handleVerify = async (e: FormEvent) => {
    e.preventDefault()
    setError(null)
    setBusy(true)
    try {
      await authApi.twoFactorVerify(code)
      setSuccess('Two-factor authentication is now enabled.')
      setCode('')
      setView('enabled')
    } catch (err) {
      setError(
        err instanceof ApiError
          ? err.message
          : 'Verification failed. Try again.',
      )
    } finally {
      setBusy(false)
    }
  }

  const handleDisable = async () => {
    setError(null)
    setSuccess(null)
    setBusy(true)
    try {
      await authApi.twoFactorDisable()
      setSuccess('Two-factor authentication has been disabled.')
      setView('disabled')
    } catch (err) {
      setError(
        err instanceof ApiError ? err.message : 'Failed to disable 2FA.',
      )
    } finally {
      setBusy(false)
    }
  }

  if (view === 'loading') {
    return (
      <div className="flex items-center justify-center py-24">
        <p className="text-muted-foreground text-sm">Loading security settings…</p>
      </div>
    )
  }

  return (
    <div className="px-5 py-16 md:px-10 md:py-24">
      <div className="mx-auto max-w-xl space-y-6">
        <div>
          <h1 className="font-heading text-3xl font-semibold text-accent">
            Security Settings
          </h1>
          <p className="text-muted-foreground mt-2 text-sm">
            Manage two-factor authentication for your account.
          </p>
        </div>

        {error && (
          <div
            role="alert"
            className="bg-destructive/10 text-destructive rounded-2xl border border-destructive/20 p-3 text-sm"
          >
            {error}
          </div>
        )}
        {success && (
          <div
            role="status"
            className="rounded-2xl border border-green-200 bg-green-50 p-3 text-sm text-green-800"
          >
            {success}
          </div>
        )}

        {view === 'disabled' && (
          <Card>
            <CardContent className="p-6">
              <h2 className="text-lg font-semibold">
                Two-factor authentication
              </h2>
              <p className="text-muted-foreground mt-1 text-sm">
                Add an extra layer of security by requiring a code from an
                authenticator app each time you sign in.
              </p>
              <Button
                onClick={handleBeginSetup}
                disabled={busy}
                className="mt-4"
              >
                {busy ? 'Setting up…' : 'Enable 2FA'}
              </Button>
            </CardContent>
          </Card>
        )}

        {view === 'setup' && (
          <Card>
            <CardContent className="space-y-5 p-6">
              <h2 className="text-lg font-semibold">
                Set up your authenticator
              </h2>
              <p className="text-muted-foreground text-sm">
                Scan the QR code below with your authenticator app (such as
                Google Authenticator, Authy, or 1Password), then enter the
                6-digit code to verify.
              </p>

              <div className="flex justify-center rounded-xl bg-white p-4">
                <img
                  src={`https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=${encodeURIComponent(qrUri)}`}
                  alt="QR code for authenticator setup"
                  width={200}
                  height={200}
                />
              </div>

              <div>
                <p className="text-muted-foreground text-xs">
                  Can&apos;t scan? Enter this key manually:
                </p>
                <code className="mt-1 block rounded bg-muted px-3 py-2 text-sm font-mono tracking-widest select-all">
                  {sharedKey}
                </code>
              </div>

              <form onSubmit={handleVerify} className="flex flex-col gap-4">
                <label className="flex flex-col gap-2">
                  <span className="text-sm font-semibold">Verification code</span>
                  <Input
                    type="text"
                    inputMode="numeric"
                    pattern="[0-9]*"
                    autoComplete="one-time-code"
                    maxLength={6}
                    required
                    autoFocus
                    value={code}
                    onChange={(e) => setCode(e.target.value)}
                  />
                </label>
                <Button type="submit" disabled={busy}>
                  {busy ? 'Verifying…' : 'Verify and enable'}
                </Button>
              </form>
            </CardContent>
          </Card>
        )}

        {view === 'enabled' && (
          <Card>
            <CardContent className="p-6">
              <h2 className="text-lg font-semibold">
                Two-factor authentication is on
              </h2>
              <p className="text-muted-foreground mt-1 text-sm">
                Your account is protected with an authenticator app. You will
                need your authenticator code each time you sign in.
              </p>
              <Button
                variant="destructive"
                onClick={handleDisable}
                disabled={busy}
                className="mt-4"
              >
                {busy ? 'Disabling…' : 'Disable 2FA'}
              </Button>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  )
}
