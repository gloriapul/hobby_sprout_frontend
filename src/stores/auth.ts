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
  const session = ref<string | null>(getFromStorage('session', null))

  // Computed
  const isAuthenticated = computed(() => !!session.value && !!user.value)

  // Actions
  const login = async (username: string, password: string): Promise<boolean> => {
    try {
      console.log('[auth.ts] login() called with:', { username, password })
      const response = await ApiService.callConceptAction<
        { user: string; session: string } | { error: string }
      >('PasswordAuthentication', 'authenticate', { username, password })
      console.log('[auth.ts] login() response:', response)

      if ('error' in response) {
        console.error('[auth.ts] login() error:', response.error)
        return false
      }

      const { user: userId, session: sessionToken } = response
      const userData = {
        id: userId,
        username: username,
      }

      user.value = userData
      session.value = sessionToken
      setToStorage('user', userData)
      setToStorage('session', sessionToken)
      console.log('[auth.ts] login() set user and session:', {
        user: userData,
        session: sessionToken,
      })

      return true
    } catch (error) {
      console.error('[auth.ts] login() exception:', error)
      return false
    }
  }

  const register = async (username: string, password: string): Promise<boolean> => {
    try {
      console.log('[auth.ts] register() called with:', { username, password })
      const response = await ApiService.callConceptAction<
        { user: string; session: string } | { error: string }
      >('PasswordAuthentication', 'register', { username, password })
      console.log('[auth.ts] register() response:', response)

      if ('error' in response) {
        console.error('[auth.ts] register() error:', response.error)
        throw new Error(response.error || 'Registration failed')
      }

      const { user: userId, session: sessionToken } = response
      const userData = {
        id: userId,
        username: username,
      }

      user.value = userData
      session.value = sessionToken
      setToStorage('user', userData)
      setToStorage('session', sessionToken)
      console.log('[auth.ts] register() set user and session:', {
        user: userData,
        session: sessionToken,
      })

      return true
    } catch (error) {
      console.error('[auth.ts] register() exception:', error)
      throw error
    }
  }

  const logout = async () => {
    try {
      console.log('[auth.ts] logout() called')
      await ApiService.callConceptAction('logout', '', {})
      console.log('[auth.ts] logout() backend call complete')
    } finally {
      user.value = null
      session.value = null
      removeFromStorage('user')
      removeFromStorage('session')
      console.log('[auth.ts] logout() cleared user and session')
      // Redirect to login page
      if (window.location.pathname !== '/login') {
        window.location.href = '/login'
      }
    }
  }

  return {
    // State
    user,
    session,

    // Computed
    isAuthenticated,

    // Actions
    login,
    register,
    logout,
  }
})
