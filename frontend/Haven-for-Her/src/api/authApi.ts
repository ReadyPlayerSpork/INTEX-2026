import { api } from './client'
import type { SessionResponse } from './types'

export interface RegisterPayload {
  email: string
  password: string
  persona: string
  acquisitionSource: string
  acquisitionDetail?: string
}

export const authApi = {
  /** Get current user session */
  me(): Promise<SessionResponse> {
    return api.get<SessionResponse>('/api/auth/me')
  },

  /** Sign out the current user */
  logout(): Promise<void> {
    return api.post('/api/auth/logout')
  },

  /** Register a new user with persona and acquisition source */
  register(payload: RegisterPayload): Promise<void> {
    return api.post('/api/account/register', payload)
  },

  /** Sign in with email + password via Identity API */
  login(email: string, password: string): Promise<void> {
    return api.post('/api/auth/login', { email, password })
  },
}
