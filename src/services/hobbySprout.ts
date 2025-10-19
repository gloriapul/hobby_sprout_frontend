import { ApiService } from './api'

/**
 * HobbySprout API Service
 *
 * This service provides methods to interact with the HobbySprout backend
 * following the concept-based API structure defined in the tools/api-extraction-from-spec.md
 */

// Define common types that might be used across the API
export interface ApiError {
  error: string
}

export interface User {
  id: string
  name: string
  email: string
  // Add other user properties as needed
}

export interface Hobby {
  id: string
  name: string
  description: string
  userId: string
  createdAt: string
  // Add other hobby properties as needed
}

/**
 * Example service methods following the concept pattern
 * These are placeholders and should be updated based on your actual backend concepts
 */
export class HobbySproutService {
  /**
   * User Management Concept Methods
   */
  static async createUser(userData: {
    name: string
    email: string
    password: string
  }): Promise<User | ApiError> {
    return ApiService.callConceptAction<User | ApiError>('User', 'createUser', userData)
  }

  static async getUserProfile(userId: string): Promise<User | ApiError> {
    return ApiService.callConceptAction<User | ApiError>('User', 'getProfile', { userId })
  }

  static async updateUserProfile(userId: string, updates: Partial<User>): Promise<User | ApiError> {
    return ApiService.callConceptAction<User | ApiError>('User', 'updateProfile', {
      userId,
      ...updates,
    })
  }

  /**
   * Hobby Management Concept Methods
   */
  static async createHobby(hobbyData: {
    name: string
    description: string
    userId: string
  }): Promise<Hobby | ApiError> {
    return ApiService.callConceptAction<Hobby | ApiError>('Hobby', 'createHobby', hobbyData)
  }

  static async getUserHobbies(userId: string): Promise<Hobby[] | ApiError> {
    return ApiService.callConceptAction<Hobby[] | ApiError>('Hobby', '_getUserHobbies', { userId })
  }

  static async updateHobby(hobbyId: string, updates: Partial<Hobby>): Promise<Hobby | ApiError> {
    return ApiService.callConceptAction<Hobby | ApiError>('Hobby', 'updateHobby', {
      hobbyId,
      ...updates,
    })
  }

  static async deleteHobby(hobbyId: string): Promise<{} | ApiError> {
    return ApiService.callConceptAction<{} | ApiError>('Hobby', 'deleteHobby', { hobbyId })
  }

  /**
   * Utility method to check if response is an error
   */
  static isError(response: any): response is ApiError {
    return response && typeof response.error === 'string'
  }
}

export default HobbySproutService
