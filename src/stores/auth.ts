import { ref, computed } from 'vue'
import { defineStore } from 'pinia'
import { ApiService } from '@/services/api'
import { getFromStorage, setToStorage, removeFromStorage } from '@/utils'

interface User {
  id: string
  username: string
}

interface AuthState {
  user: User | null
  token: string | null
  isAuthenticated: boolean
}

export const useAuthStore = defineStore('auth', () => {
  // State
  const user = ref<User | null>(getFromStorage('user', null))
  const token = ref<string | null>(getFromStorage('token', null))

  // Computed
  const isAuthenticated = computed(() => !!token.value && !!user.value)

  // Actions
  const login = async (username: string, password: string): Promise<boolean> => {
    try {
      const response = await ApiService.callConceptAction<{ user: string } | { error: string }>(
        'PasswordAuthentication',
        'authenticate',
        { username, password },
      )

      if ('error' in response) {
        console.error('Login failed:', response.error)
        return false
      }

      // Set user data
      const userData = {
        id: response.user,
        username: username,
      }

      user.value = userData
      token.value = response.user // Using user ID as token for now

      // Persist to localStorage
      setToStorage('user', userData)
      setToStorage('token', response.user)

      return true
    } catch (error) {
      console.error('Login error:', error)
      return false
    }
  }

  const register = async (username: string, password: string): Promise<boolean> => {
    try {
      const response = await ApiService.callConceptAction<{ user: string } | { error: string }>(
        'PasswordAuthentication',
        'register',
        { username, password },
      )

      if ('error' in response) {
        console.error('Registration failed:', response.error)
        return false
      }

      // Set user data
      const userData = {
        id: response.user,
        username: username,
      }

      user.value = userData
      token.value = response.user // Using user ID as token for now

      // Persist to localStorage
      setToStorage('user', userData)
      setToStorage('token', response.user)

      return true
    } catch (error) {
      console.error('Registration error:', error)
      return false
    }
  }

  const logout = () => {
    user.value = null
    token.value = null

    // Clear localStorage
    removeFromStorage('user')
    removeFromStorage('token')
  }

  const checkAuth = () => {
    const storedUser = getFromStorage('user', null)
    const storedToken = getFromStorage('token', null)

    if (storedUser && storedToken) {
      user.value = storedUser
      token.value = storedToken
      return true
    }

    return false
  }

  return {
    // State
    user,
    token,

    // Computed
    isAuthenticated,

    // Actions
    login,
    register,
    logout,
    checkAuth,
  }
})
