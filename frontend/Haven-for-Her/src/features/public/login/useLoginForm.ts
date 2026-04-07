import { useEffect, useMemo, useState, type FormEvent } from "react"
import { useNavigate, useSearchParams } from "react-router-dom"

import { authApi } from "@/api/authApi"
import { ApiError } from "@/api/client"
import { useAuth } from "@/hooks/useAuth"
import { getGoogleSignInUrl } from "@/lib/auth"
import { getLandingPath } from "@/lib/roles"

export function useLoginForm() {
  const navigate = useNavigate()
  const { refresh } = useAuth()
  const [searchParams] = useSearchParams()
  const externalError = searchParams.get("externalError")

  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
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

  const googleSignInUrl = useMemo(() => getGoogleSignInUrl("/"), [])

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    setError(null)
    setLoading(true)

    try {
      await authApi.login(email, password)
      const session = await authApi.me()
      await refresh()
      navigate(getLandingPath(session.roles))
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

  return {
    email,
    password,
    error,
    loading,
    googleAvailable,
    googleSignInUrl,
    onEmailChange: setEmail,
    onPasswordChange: setPassword,
    onSubmit: handleSubmit,
  }
}
