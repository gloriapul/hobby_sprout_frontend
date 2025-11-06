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
  createdAt: string
  updatedAt: string
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
