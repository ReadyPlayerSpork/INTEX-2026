import { createContext } from 'react'

export interface AuthState {
  isAuthenticated: boolean
  userName: string | null
  email: string | null
  roles: string[]
  isLoading: boolean
}

export interface AuthContextValue extends AuthState {
  refresh: () => Promise<void>
  logout: () => Promise<void>
  hasRole: (...roles: string[]) => boolean
}

export const INITIAL_AUTH_STATE: AuthState = {
  isAuthenticated: false,
  userName: null,
  email: null,
  roles: [],
  isLoading: true,
}

export const AuthContext = createContext<AuthContextValue | null>(null)
