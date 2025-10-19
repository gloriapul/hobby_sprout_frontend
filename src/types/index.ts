/**
 * Common API response types
 */
export interface ApiError {
  error: string
}

/**
 * User related types
 */
export interface User {
  id: string
  name: string
  email: string
  createdAt: string
  updatedAt: string
}

export interface CreateUserData {
  name: string
  email: string
  password: string
}

export interface UpdateUserData {
  name?: string
  email?: string
}

/**
 * Hobby related types
 */
export interface Hobby {
  id: string
  name: string
  description: string
  userId: string
  createdAt: string
  updatedAt: string
  isActive: boolean
}

export interface CreateHobbyData {
  name: string
  description: string
  userId: string
}

export interface UpdateHobbyData {
  name?: string
  description?: string
  isActive?: boolean
}

/**
 * API Response wrapper types
 */
export type ApiResponse<T> = T | ApiError

/**
 * Utility type to check if response is an error
 */
export function isApiError(response: any): response is ApiError {
  return response && typeof response.error === 'string'
}

/**
 * Navigation and routing types
 */
export interface RouteInfo {
  name: string
  path: string
  title: string
}
