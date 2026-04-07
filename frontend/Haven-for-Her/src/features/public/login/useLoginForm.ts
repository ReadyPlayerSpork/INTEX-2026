import { useState, type FormEvent } from "react"
import { useNavigate, useSearchParams } from "react-router-dom"

import { authApi } from "@/api/authApi"
import { ApiError } from "@/api/client"
import { useAuth } from "@/hooks/useAuth"
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
    onEmailChange: setEmail,
    onPasswordChange: setPassword,
    onSubmit: handleSubmit,
  }
}
