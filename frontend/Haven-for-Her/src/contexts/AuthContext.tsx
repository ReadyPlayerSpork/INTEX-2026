import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from 'react'
import { authApi } from '@/api/authApi'
import type { SessionResponse } from '@/api/types'

interface AuthState {
  isAuthenticated: boolean
  userName: string | null
  email: string | null
  roles: string[]
  isLoading: boolean
}

interface AuthContextValue extends AuthState {
  /** Re-fetch the session from the backend */
  refresh: () => Promise<void>
  /** Log out and clear session */
  logout: () => Promise<void>
  /** Check if the user has at least one of the given roles */
  hasRole: (...roles: string[]) => boolean
}

const AuthContext = createContext<AuthContextValue | null>(null)

const INITIAL_STATE: AuthState = {
  isAuthenticated: false,
  userName: null,
  email: null,
  roles: [],
  isLoading: true,
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [state, setState] = useState<AuthState>(INITIAL_STATE)

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
      setState({ ...INITIAL_STATE, isLoading: false })
    }
  }, [])

  const logout = useCallback(async () => {
    await authApi.logout()
    setState({ ...INITIAL_STATE, isLoading: false })
  }, [])

  const hasRole = useCallback(
    (...roles: string[]) =>
      state.roles.some((r) => roles.includes(r)),
    [state.roles],
  )

  useEffect(() => {
    void hydrate()
  }, [hydrate])

  const value = useMemo<AuthContextValue>(
    () => ({ ...state, refresh: hydrate, logout, hasRole }),
    [state, hydrate, logout, hasRole],
  )

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

export function useAuth(): AuthContextValue {
  const ctx = useContext(AuthContext)
  if (!ctx) throw new Error('useAuth must be used within <AuthProvider>')
  return ctx
}
