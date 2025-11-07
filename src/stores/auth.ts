import { ref, computed } from 'vue'
import { defineStore } from 'pinia'
import { ApiService } from '@/services/api'
import { getFromStorage, setToStorage, removeFromStorage } from '@/utils'

interface User {
  id: string
  username: string
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
      const response = await ApiService.callConceptAction<
        { user: string; session: string } | { error: string }
      >('PasswordAuthentication', 'authenticate', { username, password })

      if ('error' in response) {
        return false
      }

      // Set user data
      const userData = {
        id: response.user,
        username: username,
      }

      user.value = userData
      token.value = response.session // Store session token from backend

      // Persist to localStorage
      setToStorage('user', userData)
      setToStorage('token', response.session)

      return true
    } catch (error) {
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
        return false
      }

      return await login(username, password)
    } catch (error) {
      return false
    }
  }

  const logout = async () => {
    try {
      // Invalidate session on the backend
      await ApiService.callConceptAction('logout', '', {})
    } finally {
      // Always clear local state regardless of backend call success
      user.value = null
      token.value = null
      removeFromStorage('user')
      removeFromStorage('token')
    }
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
  }
})
