import axios, { type AxiosInstance, type AxiosResponse } from 'axios'
import { useAuthStore } from '@/stores/auth'
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

// Request interceptor to automatically add session token
apiClient.interceptors.request.use(
  (config) => {
    console.log('--- [Axios Interceptor Debug] ---')
    console.log('Request URL:', config.url)
    const isPublic = PUBLIC_ENDPOINTS.some((endpoint) => config.url?.endsWith(endpoint))
    console.log('Is Public Endpoint:', isPublic)
    const token = getFromStorage('token', null)
    console.log('Token from localStorage:', token)
    if (!isPublic) {
      if (token) {
        config.headers.Authorization = `Bearer ${token}`
        console.log('Authorization header set:', config.headers.Authorization)
      } else {
        console.log('No token found, Authorization header NOT set.')
      }
    } else {
      console.log('Public endpoint, Authorization header not required.')
    }
    console.log('Final Request Headers:', config.headers)
    console.log('Request Data:', config.data)
    console.log('-------------------------------')
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
      const response = await apiClient.post(endpoint, data)
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
