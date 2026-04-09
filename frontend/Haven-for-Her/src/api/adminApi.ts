import { api } from './client'
import type { PaginatedResponse } from './types'

export interface UserDto {
  id: string
  email: string
  persona: string | null
  acquisitionSource: string | null
  roles: string[]
  createdAtUtc: string
}

export const adminApi = {
  /** List users with optional search and pagination */
  listUsers(params?: {
    search?: string
    page?: number
    pageSize?: number
  }): Promise<PaginatedResponse<UserDto>> {
    const qs = new URLSearchParams()
    if (params?.search) qs.set('search', params.search)
    if (params?.page) qs.set('page', String(params.page))
    if (params?.pageSize) qs.set('pageSize', String(params.pageSize))
    const query = qs.toString()
    return api.get(`/api/admin/users${query ? `?${query}` : ''}`)
  },

  /** Get a single user */
  getUser(userId: string): Promise<UserDto> {
    return api.get(`/api/admin/users/${userId}`)
  },

  /** Add a role to a user */
  addRole(userId: string, role: string): Promise<void> {
    return api.post(`/api/admin/users/${userId}/roles`, { role })
  },

  /** Remove a role from a user */
  removeRole(userId: string, role: string): Promise<void> {
    return api.delete(`/api/admin/users/${userId}/roles/${role}`)
  },

  /** Permanently delete a user account */
  deleteUser(userId: string): Promise<void> {
    return api.delete(`/api/admin/users/${userId}`)
  },

  /** Create a new user with optional initial roles */
  createUser(payload: { email: string; password: string; roles?: string[] }): Promise<UserDto> {
    return api.post('/api/admin/users', payload)
  },
}
