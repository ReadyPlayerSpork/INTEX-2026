import { useEffect, useMemo, useState, type FormEvent } from "react"
import { useNavigate, useSearchParams } from "react-router-dom"

import { authApi } from "@/api/authApi"
import { ApiError } from "@/api/client"
import { useAuth } from "@/hooks/useAuth"
import { getGoogleSignInUrl } from "@/lib/auth"
import { getLandingPath } from "@/lib/roles"

/** Internal paths only — avoids open redirects. */
function safeReturnPath(raw: string | null): string | null {
  if (!raw || !raw.startsWith("/") || raw.startsWith("//")) return null
  return raw
}

export type LoginStep = "credentials" | "two-factor"

export function useLoginForm() {
  const navigate = useNavigate()
  const { refresh } = useAuth()
  const [searchParams] = useSearchParams()
  const externalError = searchParams.get("externalError")

  const [step, setStep] = useState<LoginStep>("credentials")
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [twoFactorCode, setTwoFactorCode] = useState("")
  const [error, setError] = useState<string | null>(externalError)
  const [loading, setLoading] = useState(false)
  const [googleAvailable, setGoogleAvailable] = useState(false)

  useEffect(() => {
    let isActive = true

    authApi
      .providers()
      .then((providers) => {
        if (!isActive) return
        setGoogleAvailable(
          providers.some((provider) => provider.name.toLowerCase() === "google"),
        )
      })
      .catch(() => {
        if (!isActive) return
        setGoogleAvailable(false)
      })

    return () => {
      isActive = false
    }
  }, [])

  const returnPath = searchParams.get("returnUrl")
  const safeNext = safeReturnPath(returnPath)

  const googleSignInUrl = useMemo(
    () => getGoogleSignInUrl(safeNext ?? "/"),
    [safeNext],
  )

  const completeLogin = async () => {
    const session = await authApi.me()
    await refresh()
    navigate(safeNext ?? getLandingPath(session.roles))
  }

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    setError(null)
    setLoading(true)

    try {
      const result = await authApi.login(email, password)
      if (result.requiresTwoFactor) {
        setStep("two-factor")
      } else {
        await completeLogin()
      }
    } catch (err) {
      if (err instanceof ApiError) {
        setError(err.status === 401 ? "Invalid email or password." : err.message)
      } else {
        setError("An unexpected error occurred.")
      }
    } finally {
      setLoading(false)
    }
  }

  const handleTwoFactorSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    setError(null)
    setLoading(true)

    try {
      await authApi.loginTwoFactor(email, twoFactorCode)
      await completeLogin()
    } catch (err) {
      if (err instanceof ApiError) {
        setError(err.status === 401 ? "Invalid authenticator code." : err.message)
      } else {
        setError("An unexpected error occurred.")
      }
    } finally {
      setLoading(false)
    }
  }

  const backToCredentials = () => {
    setStep("credentials")
    setTwoFactorCode("")
    setError(null)
  }

  return {
    step,
    email,
    password,
    twoFactorCode,
    error,
    loading,
    googleAvailable,
    googleSignInUrl,
    onEmailChange: setEmail,
    onPasswordChange: setPassword,
    onTwoFactorCodeChange: setTwoFactorCode,
    onSubmit: handleSubmit,
    onTwoFactorSubmit: handleTwoFactorSubmit,
    backToCredentials,
  }
}
