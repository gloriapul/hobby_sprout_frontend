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
    // The response object itself will contain user and session
    const response = await ApiService.callConceptAction<{ user: string; session: string } | { error: string }>(
      'PasswordAuthentication',
      'authenticate',
      { username, password },
    );

    if ('error' in response) {
      console.error('Login failed:', response.error);
      return false;
    }

    // CORRECT: Destructure the 'user' and 'session' properties directly from the response
    const { user: userId, session: sessionToken } = response;

    const userData = {
      id: userId,
      username: username,
    };

    user.value = userData;
    token.value = sessionToken;

    setToStorage('user', userData);
    setToStorage('token', sessionToken);

    return true;
  } catch (error) {
    console.error('An unexpected error occurred during login:', error);
    return false;
  }
};

  const register = async (username: string, password: string): Promise<boolean> => {
    try {
      const response = await ApiService.callConceptAction<
        { msg: { user: string; session: string } } | { error: string }
      >('PasswordAuthentication', 'register', { username, password })

      if ('error' in response) {
        throw new Error(response.error || 'Registration failed')
      }

      // Destructure user and session from response.msg
      const { user: userId, session } = response.msg
      const userData = {
        id: userId,
        username: username,
      }

      user.value = userData
      token.value = session
      setToStorage('user', userData)
      setToStorage('token', session)

      return true
    } catch (error) {
      throw error
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
