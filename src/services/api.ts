import axios, { type AxiosInstance, type AxiosResponse } from 'axios'
import { getFromStorage, removeFromStorage } from '@/utils'

const API_BASE = import.meta.env.VITE_API_BASE_URL || '/api'

// List of public endpoints that don't require session token
const PUBLIC_ENDPOINTS = [
  '/PasswordAuthentication/register',
  '/PasswordAuthentication/authenticate'
]

// Create axios instance with default configuration
const apiClient: AxiosInstance = axios.create({
  baseURL: API_BASE,
  timeout: 60000, // 60 seconds to allow for LLM generation
  headers: {
    'Content-Type': 'application/json',
  },
})

// Request interceptor to automatically add session token
apiClient.interceptors.request.use(
  (config) => {
    console.log('[api.ts] interceptor: config.url =', config.url)
    const isPublic = PUBLIC_ENDPOINTS.some((endpoint) => config.url?.endsWith(endpoint))
    console.log('[api.ts] interceptor: isPublic =', isPublic)
    
    if (!isPublic) {
      const session = getFromStorage('session', null)
      console.log('[api.ts] interceptor: session from storage =', session)
      
      if (session) {
        // ✅ Add session to Authorization header (preferred method)
        config.headers.Authorization = `Bearer ${session}`
        console.log('[api.ts] interceptor: added session to Authorization header')
      } else {
        console.warn('[api.ts] interceptor: no session found in storage for authenticated endpoint')
      }
    }
    return config
  },
  (error) => {
    console.error('[api.ts] interceptor: request error =', error)
    return Promise.reject(error)
  },
)

// Response interceptor (for handling common response patterns)
apiClient.interceptors.response.use(
  (response: AxiosResponse) => {
    console.log('[api.ts] response interceptor: success', response.data)
    return response
  },
  (error) => {
    console.error('[api.ts] response interceptor: error', error.response?.data || error.message)

    // Clear stale session only on authentication failures (not timeouts)
    if (error.response?.status === 401) {
      console.log('[api.ts] response interceptor: 401 error, clearing session')
      removeFromStorage('session')
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
      console.log('[api.ts] callConceptAction:', { conceptName, actionName, data })
      const endpoint = actionName ? `/${conceptName}/${actionName}` : `/${conceptName}`
      console.log('[api.ts] callConceptAction: endpoint =', endpoint)
      const response = await apiClient.post(endpoint, data)
      console.log('[api.ts] callConceptAction: response =', response.data)
      return response.data
    } catch (error) {
      console.error('[api.ts] callConceptAction: error =', error)
      throw error
    }
  }

  /**
   * Generic GET request (if needed for non-concept endpoints)
   */
  static async get<T = any>(endpoint: string): Promise<T> {
    try {
      console.log('[api.ts] get:', endpoint)
      const response = await apiClient.get(endpoint)
      console.log('[api.ts] get: response =', response.data)
      return response.data
    } catch (error) {
      console.error('[api.ts] get: error =', error)
      throw error
    }
  }

  /**
   * Generic POST request
   */
  static async post<T = any>(endpoint: string, data: any = {}): Promise<T> {
    try {
      console.log('[api.ts] post:', { endpoint, data })
      const response = await apiClient.post(endpoint, data)
      console.log('[api.ts] post: response =', response.data)
      return response.data
    } catch (error) {
      console.error('[api.ts] post: error =', error)
      throw error
    }
  }
}

export default apiClient
