import { api } from './client'
import type {
  LoginResponse,
  SessionResponse,
  TwoFactorSetupResponse,
  TwoFactorStatusResponse,
} from './types'

export interface RegisterPayload {
  email: string
  password: string
  persona: string
  acquisitionSource: string
  acquisitionDetail?: string
}

export interface ExternalProvider {
  name: string
  displayName: string
}

export const authApi = {
  me(): Promise<SessionResponse> {
    return api.get<SessionResponse>('/api/auth/me')
  },

  logout(): Promise<void> {
    return api.post('/api/auth/logout')
  },

  register(payload: RegisterPayload): Promise<void> {
    return api.post('/api/account/register', payload)
  },

  login(email: string, password: string): Promise<LoginResponse> {
    return api.post('/api/auth/login', { email, password })
  },

  loginTwoFactor(email: string, code: string): Promise<void> {
    return api.post('/api/auth/login-2fa', { email, code })
  },

  providers(): Promise<ExternalProvider[]> {
    return api.get<ExternalProvider[]>('/api/auth/providers')
  },

  // 2FA management
  twoFactorStatus(): Promise<TwoFactorStatusResponse> {
    return api.get<TwoFactorStatusResponse>('/api/auth/2fa/status')
  },

  twoFactorSetup(): Promise<TwoFactorSetupResponse> {
    return api.post('/api/auth/2fa/setup')
  },

  twoFactorVerify(code: string): Promise<void> {
    return api.post('/api/auth/2fa/verify', { code })
  },

  twoFactorDisable(): Promise<void> {
    return api.post('/api/auth/2fa/disable')
  },
}
