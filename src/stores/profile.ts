import { ref, computed } from 'vue'
import { defineStore } from 'pinia'
import { ApiService } from '@/services/api'

interface Profile {
  name: string
  image: string
}

export const useProfileStore = defineStore('profile', () => {
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

      // Extract userProfile array from response object
      const userProfileArray = response?.userProfile || response

      if (Array.isArray(userProfileArray) && userProfileArray.length > 0) {
        // The response is an array with profile data
        const profileData = userProfileArray[0]
        profile.value = {
          name: profileData.displayname || '',
          image: profileData.profile || '',
        }

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
      const response = await ApiService.callConceptAction<{} | { error: string }>(
        'UserProfile',
        'setName',
        { displayname: name }, // Session token added automatically by ApiService
      )

      if ('error' in response) {
        throw new Error(response.error)
      }

      // Update local state
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
      const response = await ApiService.callConceptAction<{} | { error: string }>(
        'UserProfile',
        'setImage',
        { image },
      )

      if ('error' in response) {
        throw new Error(response.error)
      }

      // Update local state
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
      const response = await ApiService.callConceptAction<{} | { error: string }>(
        'UserProfile',
        'setHobby',
        { hobby }, // Session token added automatically by ApiService
      )

      if ('error' in response) {
        throw new Error(response.error)
      }

      // Reload all hobbies from backend after adding
      const hobbyResponse = await ApiService.callConceptAction<any>(
        'UserProfile',
        '_getUserHobbies',
        {}, // Session token added automatically by ApiService
      )
      // Extract hobbies array from response object
      const hobbiesArray = hobbyResponse?.hobbies || hobbyResponse

      if (Array.isArray(hobbiesArray)) {
        // Response is array of objects with {hobby, active}
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
      const response = await ApiService.callConceptAction<{} | { error: string }>(
        'UserProfile',
        'closeHobby',
        { hobby }, // Session token added automatically by ApiService
      )

      if ('error' in response) {
        throw new Error(response.error)
      }

      // Reload all hobbies from backend after closing
      const hobbyResponse = await ApiService.callConceptAction<any>(
        'UserProfile',
        '_getUserHobbies',
        {}, // Session token added automatically by ApiService
      )

      // Extract hobbies array from response object
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
