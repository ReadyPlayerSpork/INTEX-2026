import { useCallback, useEffect, useState, type FormEvent } from 'react'
import { useNavigate } from 'react-router-dom'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { authApi, type ProfileResponse } from '@/api/authApi'
import { ApiError } from '@/api/client'
import { useAuth } from '@/hooks/useAuth'

type TwoFaView = 'loading' | 'disabled' | 'setup' | 'enabled'

export function AccountPage() {
  const navigate = useNavigate()
  const { logout } = useAuth()
  const [profile, setProfile] = useState<ProfileResponse | null>(null)
  const [profileLoading, setProfileLoading] = useState(true)

  const [editEmail, setEditEmail] = useState('')
  const [editUserName, setEditUserName] = useState('')
  const [editPhone, setEditPhone] = useState('')
  const [profileSaving, setProfileSaving] = useState(false)
  const [profileMsg, setProfileMsg] = useState<string | null>(null)
  const [profileError, setProfileError] = useState<string | null>(null)

  const [twoFaView, setTwoFaView] = useState<TwoFaView>('loading')
  const [sharedKey, setSharedKey] = useState('')
  const [qrUri, setQrUri] = useState('')
  const [code, setCode] = useState('')
  const [twoFaError, setTwoFaError] = useState<string | null>(null)
  const [twoFaSuccess, setTwoFaSuccess] = useState<string | null>(null)
  const [twoFaBusy, setTwoFaBusy] = useState(false)

  const loadProfile = useCallback(async () => {
    try {
      const data = await authApi.getProfile()
      setProfile(data)
      setEditEmail(data.email ?? '')
      setEditUserName(data.userName ?? '')
      setEditPhone(data.phoneNumber ?? '')
    } catch {
      setProfileError('Unable to load profile.')
    } finally {
      setProfileLoading(false)
    }
  }, [])

  const loadTwoFaStatus = useCallback(async () => {
    try {
      const { isEnabled } = await authApi.twoFactorStatus()
      setTwoFaView(isEnabled ? 'enabled' : 'disabled')
    } catch {
      setTwoFaError('Unable to load 2FA status.')
    }
  }, [])

  useEffect(() => {
    loadProfile()
    loadTwoFaStatus()
  }, [loadProfile, loadTwoFaStatus])

  const handleProfileSave = async (e: FormEvent) => {
    e.preventDefault()
    setProfileError(null)
    setProfileMsg(null)
    setProfileSaving(true)
    try {
      const payload: Record<string, string> = {}
      if (editUserName !== (profile?.userName ?? '')) payload.userName = editUserName
      if (editEmail !== (profile?.email ?? '')) payload.email = editEmail
      if (editPhone !== (profile?.phoneNumber ?? '')) payload.phoneNumber = editPhone

      if (Object.keys(payload).length === 0) {
        setProfileMsg('No changes to save.')
        setProfileSaving(false)
        return
      }

      await authApi.updateProfile(payload)
      setProfileMsg('Profile updated successfully.')
      await loadProfile()
    } catch (err) {
      setProfileError(err instanceof ApiError ? err.message : 'Failed to update profile.')
    } finally {
      setProfileSaving(false)
    }
  }

  const handleBeginSetup = async () => {
    setTwoFaError(null)
    setTwoFaSuccess(null)
    setTwoFaBusy(true)
    try {
      const { sharedKey: key, authenticatorUri } = await authApi.twoFactorSetup()
      setSharedKey(key)
      setQrUri(authenticatorUri)
      setTwoFaView('setup')
    } catch (err) {
      setTwoFaError(err instanceof ApiError ? err.message : 'Failed to start 2FA setup.')
    } finally {
      setTwoFaBusy(false)
    }
  }

  const handleVerify = async (e: FormEvent) => {
    e.preventDefault()
    setTwoFaError(null)
    setTwoFaBusy(true)
    try {
      await authApi.twoFactorVerify(code)
      setTwoFaSuccess('Two-factor authentication is now enabled.')
      setCode('')
      setTwoFaView('enabled')
    } catch (err) {
      setTwoFaError(err instanceof ApiError ? err.message : 'Verification failed. Try again.')
    } finally {
      setTwoFaBusy(false)
    }
  }

  const handleDisable = async () => {
    setTwoFaError(null)
    setTwoFaSuccess(null)
    setTwoFaBusy(true)
    try {
      await authApi.twoFactorDisable()
      setTwoFaSuccess('Two-factor authentication has been disabled.')
      setTwoFaView('disabled')
    } catch (err) {
      setTwoFaError(err instanceof ApiError ? err.message : 'Failed to disable 2FA.')
    } finally {
      setTwoFaBusy(false)
    }
  }

  const handleLogout = async () => {
    await logout()
    navigate('/login')
  }

  if (profileLoading) {
    return (
      <div className="flex items-center justify-center py-24">
        <p className="text-muted-foreground text-sm">Loading account settings…</p>
      </div>
    )
  }

  return (
    <div className="px-5 py-16 md:px-10 md:py-24">
      <div className="mx-auto max-w-xl space-y-8">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
          <div>
            <h1 className="font-heading text-3xl font-semibold text-accent">
              Account Settings
            </h1>
            <p className="text-muted-foreground mt-2 text-sm">
              Manage your profile, contact information, and security.
            </p>
          </div>
          <Button
            type="button"
            variant="outline"
            className="shrink-0"
            onClick={() => void handleLogout()}
          >
            Log out
          </Button>
        </div>

        {/* ── Profile section ────────────────────────────── */}
        <Card>
          <CardContent className="p-6">
            <h2 className="text-lg font-semibold">Profile</h2>
            <p className="text-muted-foreground mt-1 text-sm">
              Update your name, email, and phone number.
            </p>

            {profileError && (
              <div
                role="alert"
                className="bg-destructive/10 text-destructive mt-4 rounded-2xl border border-destructive/20 p-3 text-sm"
              >
                {profileError}
              </div>
            )}
            {profileMsg && (
              <div
                role="status"
                className="mt-4 rounded-2xl border border-green-200 bg-green-50 p-3 text-sm text-green-800"
              >
                {profileMsg}
              </div>
            )}

            <form onSubmit={handleProfileSave} className="mt-4 flex flex-col gap-4">
              <label className="flex flex-col gap-2">
                <span className="text-sm font-semibold">Display name</span>
                <Input
                  type="text"
                  value={editUserName}
                  onChange={(e) => setEditUserName(e.target.value)}
                />
              </label>

              <label className="flex flex-col gap-2">
                <span className="text-sm font-semibold">Email</span>
                <Input
                  type="email"
                  value={editEmail}
                  onChange={(e) => setEditEmail(e.target.value)}
                />
              </label>

              <label className="flex flex-col gap-2">
                <span className="text-sm font-semibold">Phone number</span>
                <Input
                  type="tel"
                  value={editPhone}
                  onChange={(e) => setEditPhone(e.target.value)}
                  placeholder="Optional"
                />
              </label>

              {profile && (
                <div className="text-muted-foreground mt-1 flex flex-col gap-1 text-xs">
                  {profile.persona && <span>Persona: {profile.persona}</span>}
                  <span>
                    Roles: {profile.roles.length > 0 ? profile.roles.join(', ') : 'None'}
                  </span>
                  <span>
                    Member since{' '}
                    {new Date(profile.createdAt).toLocaleDateString()}
                  </span>
                </div>
              )}

              <Button type="submit" disabled={profileSaving} className="mt-2">
                {profileSaving ? 'Saving…' : 'Save changes'}
              </Button>
            </form>
          </CardContent>
        </Card>

        {/* ── Two-factor authentication section ──────────── */}
        <Card>
          <CardContent className="p-6 space-y-4">
            <div>
              <h2 className="text-lg font-semibold">
                Two-factor authentication
              </h2>
              <p className="text-muted-foreground mt-1 text-sm">
                Add an extra layer of security by requiring a code from an
                authenticator app each time you sign in.
              </p>
            </div>

            {twoFaError && (
              <div
                role="alert"
                className="bg-destructive/10 text-destructive rounded-2xl border border-destructive/20 p-3 text-sm"
              >
                {twoFaError}
              </div>
            )}
            {twoFaSuccess && (
              <div
                role="status"
                className="rounded-2xl border border-green-200 bg-green-50 p-3 text-sm text-green-800"
              >
                {twoFaSuccess}
              </div>
            )}

            {twoFaView === 'loading' && (
              <p className="text-muted-foreground text-sm animate-pulse">
                Loading 2FA status…
              </p>
            )}

            {twoFaView === 'disabled' && (
              <Button onClick={handleBeginSetup} disabled={twoFaBusy}>
                {twoFaBusy ? 'Setting up…' : 'Enable 2FA'}
              </Button>
            )}

            {twoFaView === 'setup' && (
              <div className="space-y-5">
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
                  <Button type="submit" disabled={twoFaBusy}>
                    {twoFaBusy ? 'Verifying…' : 'Verify and enable'}
                  </Button>
                </form>
              </div>
            )}

            {twoFaView === 'enabled' && (
              <div>
                <p className="text-muted-foreground text-sm">
                  Your account is protected with an authenticator app. You will
                  need your authenticator code each time you sign in.
                </p>
                <Button
                  variant="destructive"
                  onClick={handleDisable}
                  disabled={twoFaBusy}
                  className="mt-4"
                >
                  {twoFaBusy ? 'Disabling…' : 'Disable 2FA'}
                </Button>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
