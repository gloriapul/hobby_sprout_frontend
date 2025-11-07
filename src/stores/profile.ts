import { ref, computed } from 'vue'
import { defineStore } from 'pinia'
import { ApiService } from '@/services/api'
import { useAuthStore } from '@/stores/auth'

interface Profile {
  name: string
  image: string
}

export const useProfileStore = defineStore('profile', () => {
  // Get user ID from auth store
  const authStore = useAuthStore()
  const getSession = () => authStore.session
  // State
  const profile = ref<Profile | null>(null)
  const hobbies = ref<string[]>([])
  const activeHobbies = ref<string[]>([])
  const loading = ref(false)
  const error = ref<string | null>(null)

  // Computed
  const hasProfile = computed(() => profile.value !== null)

  // Actions
  const loadProfile = async () => {
    loading.value = true
    error.value = null

    try {
      const response = await ApiService.callConceptAction<any>(
        'UserProfile',
        '_getUserProfile',
        {}, // Session token is automatically added by ApiService
      )

      // Handle both array and object userProfile responses
      let profileData = null
      if (Array.isArray(response?.userProfile)) {
        profileData = response.userProfile[0]
      } else if (response?.userProfile && typeof response.userProfile === 'object') {
        profileData = response.userProfile
      }
      if (profileData) {
        profile.value = {
          name: profileData.displayname || '',
          image: profileData.profile || '',
        }
        console.debug('[profile.ts] loadProfile: set profile.value =', profile.value)

        // Load all hobbies (active and inactive) after profile loads
        const hobbyResponse = await ApiService.callConceptAction<any>(
          'UserProfile',
          '_getUserHobbies',
          {}, // Session token is automatically added by ApiService
        )

        // Extract hobbies array from response object
        const hobbiesArray = hobbyResponse?.hobbies || hobbyResponse

        if (Array.isArray(hobbiesArray)) {
          hobbies.value = hobbiesArray.map((h) => h.hobby)
          activeHobbies.value = hobbiesArray.filter((h) => h.active).map((h) => h.hobby)
        }
      } else {
        // Profile doesn't exist yet - this means the CreateProfileAfterRegister sync hasn't completed
        // Initialize with empty values and let the user know to refresh
        profile.value = { name: '', image: '' }
        hobbies.value = []
        console.debug('[profile.ts] loadProfile: set profile.value to empty')
      }
    } catch (err: any) {
      if (err.response?.status === 504) {
        error.value =
          'Backend server timeout. The server may be overloaded or processing. Please try refreshing in a moment.'
      } else if (err.code === 'ECONNABORTED') {
        error.value = 'Connection timeout while loading profile. Please try refreshing.'
      } else {
        error.value = err.message || 'Failed to load profile'
      }
    } finally {
      loading.value = false
    }
  }

  const setName = async (name: string) => {
    loading.value = true
    error.value = null
    try {
      const session = getSession()
      if (!session) throw new Error('Session not found')
      const response = await ApiService.callConceptAction<{} | { error: string }>(
        'UserProfile',
        'setName',
        { session, displayname: name },
      )
      if ('error' in response) {
        throw new Error(response.error)
      }
      if (!profile.value) {
        profile.value = { name: '', image: '' }
      }
      profile.value.name = name
    } catch (err: any) {
      error.value = err.message || 'Failed to set name'
      throw err
    } finally {
      loading.value = false
    }
  }

  const setImage = async (image: string) => {
    loading.value = true
    error.value = null
    try {
      const session = getSession()
      if (!session) throw new Error('Session not found')
      const response = await ApiService.callConceptAction<{} | { error: string }>(
        'UserProfile',
        'setImage',
        { session, image },
      )
      if ('error' in response) {
        throw new Error(response.error)
      }
      if (!profile.value) {
        profile.value = { name: '', image: '' }
      }
      profile.value.image = image
    } catch (err: any) {
      error.value = err.message || 'Failed to set image'
      throw err
    } finally {
      loading.value = false
    }
  }

  const setHobby = async (hobby: string) => {
    loading.value = true
    error.value = null
    try {
      const session = getSession()
      if (!session) throw new Error('Session not found')
      const response = await ApiService.callConceptAction<{} | { error: string }>(
        'UserProfile',
        'setHobby',
        { session, hobby },
      )
      if ('error' in response) {
        throw new Error(response.error)
      }
      // Reload all hobbies from backend after adding
      const hobbyResponse = await ApiService.callConceptAction<any>(
        'UserProfile',
        '_getUserHobbies',
        {},
      )
      const hobbiesArray = hobbyResponse?.hobbies || hobbyResponse
      if (Array.isArray(hobbiesArray)) {
        hobbies.value = hobbiesArray.map((h) => h.hobby)
        activeHobbies.value = hobbiesArray.filter((h) => h.active).map((h) => h.hobby)
      }
    } catch (err: any) {
      error.value = err.message || 'Failed to set hobby'
      throw err
    } finally {
      loading.value = false
    }
  }

  const closeHobby = async (hobby: string) => {
    loading.value = true
    error.value = null
    try {
      const session = getSession()
      if (!session) throw new Error('Session not found')
      const response = await ApiService.callConceptAction<{} | { error: string }>(
        'UserProfile',
        'closeHobby',
        { session, hobby },
      )
      if ('error' in response) {
        throw new Error(response.error)
      }
      // Reload all hobbies from backend after closing
      const hobbyResponse = await ApiService.callConceptAction<any>(
        'UserProfile',
        '_getUserHobbies',
        {},
      )
      const hobbiesArray = hobbyResponse?.hobbies || hobbyResponse
      if (Array.isArray(hobbiesArray)) {
        hobbies.value = hobbiesArray.map((h) => h.hobby)
        activeHobbies.value = hobbiesArray.filter((h) => h.active).map((h) => h.hobby)
      }
    } catch (err: any) {
      error.value = err.message || 'Failed to close hobby'
      throw err
    } finally {
      loading.value = false
    }
  }

  return {
    // State
    profile,
    hobbies,
    activeHobbies,
    loading,
    error,

    // Computed
    hasProfile,

    // Actions
    loadProfile,
    setName,
    setImage,
    setHobby,
    closeHobby,
  }
})
