import { useCallback, useEffect, useMemo, useState, type ReactNode } from 'react'
import { authApi } from '@/api/authApi'
import type { SessionResponse } from '@/api/types'
import {
  AuthContext,
  INITIAL_AUTH_STATE,
  type AuthContextValue,
  type AuthState,
} from '@/contexts/auth-context'

export function AuthProvider({ children }: { children: ReactNode }) {
  const [state, setState] = useState<AuthState>(INITIAL_AUTH_STATE)

  const hydrate = useCallback(async () => {
    try {
      const session: SessionResponse = await authApi.me()
      setState({
        isAuthenticated: session.isAuthenticated,
        userName: session.userName,
        email: session.email,
        roles: session.roles,
        isLoading: false,
      })
    } catch {
      setState({ ...INITIAL_AUTH_STATE, isLoading: false })
    }
  }, [])

  const logout = useCallback(async () => {
    await authApi.logout()
    setState({ ...INITIAL_AUTH_STATE, isLoading: false })
  }, [])

  const hasRole = useCallback(
    (...roles: string[]) =>
      state.roles.some((r) => roles.includes(r)),
    [state.roles],
  )

  useEffect(() => {
    const timerId = window.setTimeout(() => {
      void hydrate()
    }, 0)

    return () => {
      window.clearTimeout(timerId)
    }
  }, [hydrate])

  const value = useMemo<AuthContextValue>(
    () => ({ ...state, refresh: hydrate, logout, hasRole }),
    [state, hydrate, logout, hasRole],
  )

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}
