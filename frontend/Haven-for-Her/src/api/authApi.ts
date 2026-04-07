import { api } from './client';
import type { SessionResponse } from './types';

export const authApi = {
  /** Get current user session */
  me(): Promise<SessionResponse> {
    return api.get<SessionResponse>('/api/auth/me');
  },

  /** Sign out the current user */
  logout(): Promise<void> {
    return api.post('/api/auth/logout');
  },

  /** Register a new user via Identity API */
  register(email: string, password: string): Promise<void> {
    return api.post('/api/auth/register', { email, password });
  },

  /** Sign in with email + password via Identity API */
  login(email: string, password: string): Promise<void> {
    return api.post('/api/auth/login', { email, password });
  },
};
