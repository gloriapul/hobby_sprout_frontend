import axios, { type AxiosInstance, type AxiosResponse } from 'axios'
import { getFromStorage, removeFromStorage } from '@/utils'

const API_BASE = import.meta.env.VITE_API_BASE_URL || '/api'

// List of public endpoints that don't require session token
const PUBLIC_ENDPOINTS = [
  '/PasswordAuthentication/register',
  '/PasswordAuthentication/authenticate',
  '/logout',
]

// Create axios instance with default configuration
const apiClient: AxiosInstance = axios.create({
  baseURL: API_BASE,
  timeout: 60000, // 60 seconds to allow for LLM generation
  headers: {
    'Content-Type': 'application/json',
  },
})

// Request interceptor (for adding auth tokens, logging, etc.)
apiClient.interceptors.request.use(
  (config) => {
    return config
  },
  (error) => {
    return Promise.reject(error)
  },
)

// Response interceptor (for handling common response patterns)
apiClient.interceptors.response.use(
  (response: AxiosResponse) => {
    // Handle successful responses
    return response
  },
  (error) => {
    // Handle error responses

    // Clear stale session only on authentication failures (not timeouts)
    if (error.response?.status === 401) {
      removeFromStorage('token')
      removeFromStorage('user')

      // Redirect to login if not already there
      if (window.location.pathname !== '/login' && window.location.pathname !== '/register') {
        window.location.href = '/login'
      }
    }

    return Promise.reject(error)
  },
)

// Generic API service class
export class ApiService {
  /**
   * Make a POST request to a concept endpoint
   * Based on the API structure rules from the spec file:
   * - All endpoints use POST method
   * - URL structure: /{conceptName}/{actionOrQueryName}
   * - Request body is a single JSON object
   * - Authenticated endpoints automatically include session token
   */
  static async callConceptAction<T = any>(
    conceptName: string,
    actionName: string,
    data: Record<string, any> = {},
  ): Promise<T> {
    try {
      const endpoint = actionName ? `/${conceptName}/${actionName}` : `/${conceptName}`

      // Always add session token if it exists
      let requestData = { ...data }
      const session = getFromStorage('token', null)
      if (session) {
        requestData = { ...data, session }
      }

      const response = await apiClient.post(endpoint, requestData)
      return response.data
    } catch (error) {
      throw error
    }
  }

  /**
   * Generic GET request (if needed for non-concept endpoints)
   */
  static async get<T = any>(endpoint: string): Promise<T> {
    try {
      const response = await apiClient.get(endpoint)
      return response.data
    } catch (error) {
      throw error
    }
  }

  /**
   * Generic POST request
   */
  static async post<T = any>(endpoint: string, data: any = {}): Promise<T> {
    try {
      const response = await apiClient.post(endpoint, data)
      return response.data
    } catch (error) {
      throw error
    }
  }
}

export default apiClient
