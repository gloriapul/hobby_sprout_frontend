import axios, { type AxiosInstance, type AxiosResponse } from 'axios'

const API_BASE = import.meta.env.VITE_API_BASE_URL || '/api';

// Create axios instance with default configuration
const apiClient: AxiosInstance = axios.create({
  baseURL: API_BASE,
  timeout: 10000,
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
    console.error('Request error:', error)
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
    console.error('Response error:', error)

    // You can add common error handling here
    if (error.response?.status === 401) {
      // Handle unauthorized access
      console.error('Unauthorized access - redirecting to login')
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
   */
  static async callConceptAction<T = any>(
    conceptName: string,
    actionName: string,
    data: Record<string, any> = {},
  ): Promise<T> {
    try {
      const response = await apiClient.post(`/${conceptName}/${actionName}`, data)
      return response.data
    } catch (error) {
      console.error(`Error calling ${conceptName}/${actionName}:`, error)
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
      console.error(`Error making GET request to ${endpoint}:`, error)
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
      console.error(`Error making POST request to ${endpoint}:`, error)
      throw error
    }
  }
}

export default apiClient
