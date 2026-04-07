// ---- Auth ----

export interface SessionResponse {
  isAuthenticated: boolean;
  userName: string | null;
  email: string | null;
  roles: string[];
  twoFactorEnabled: boolean;
}

export interface LoginResponse {
  requiresTwoFactor: boolean;
  message: string;
}

export interface TwoFactorSetupResponse {
  sharedKey: string;
  authenticatorUri: string;
}

export interface TwoFactorStatusResponse {
  isEnabled: boolean;
}

// ---- Shared ----

export interface PaginatedResponse<T> {
  items: T[];
  page: number;
  pageSize: number;
  totalCount: number;
  totalPages: number;
  hasPrevious: boolean;
  hasNext: boolean;
}

export interface ErrorResponse {
  message: string;
  errors?: Record<string, string[]>;
}

// ---- Query helpers ----

export interface PaginationParams {
  page?: number;
  pageSize?: number;
  sort?: string;
  direction?: 'asc' | 'desc';
  search?: string;
}
