import { ref, computed } from 'vue'
import { defineStore } from 'pinia'
import { ApiService } from '@/services/api'
import { getFromStorage } from '@/utils'

interface Profile {
  name: string
  image: string
}

export const useProfileStore = defineStore('profile', () => {
  // State
  const profile = ref<Profile | null>(null)
  const hobbies = ref<string[]>([])
  const activeHobbies = ref<string[]>([])
  const currentUserId = ref<string | null>(null)
  const loading = ref(false)
  const error = ref<string | null>(null)

  // Computed
  const hasProfile = computed(() => profile.value !== null)

  // Actions
  // Toggle hobby active/inactive
  async function setHobbyActive(hobby: string) {
    loading.value = true
    error.value = null
    try {
      await ApiService.callConceptAction('UserProfile', 'setHobby', {
        hobby, // Session token is automatically added by ApiService
      })
      // Optimistically update local state
      if (!activeHobbies.value.includes(hobby)) {
        activeHobbies.value.push(hobby)
      }
      if (!hobbies.value.includes(hobby)) {
        hobbies.value.push(hobby)
      }
    } catch (err: any) {
      error.value = err.message || 'Failed to activate hobby'
      throw err
    } finally {
      loading.value = false
    }
  }

  async function setHobbyInactive(hobby: string) {
    loading.value = true
    error.value = null
    try {
      await ApiService.callConceptAction('UserProfile', 'closeHobby', {
        hobby, // Session token is automatically added by ApiService
      })
      // Optimistically update local state
      activeHobbies.value = activeHobbies.value.filter((h) => h !== hobby)
    } catch (err: any) {
      error.value = err.message || 'Failed to deactivate hobby'
      throw err
    } finally {
      loading.value = false
    }
  }
  const loadProfile = async (userId?: string) => {
    console.log('🔄 loadProfile called')
    loading.value = true
    error.value = null
    if (userId) {
      currentUserId.value = userId
    }

    try {
      const response = await ApiService.callConceptAction<any>(
        'UserProfile',
        '_getUserProfile',
        {}, // Session token is automatically added by ApiService
      )

      console.log('🔍 loadProfile - _getUserProfile response:', response)

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

        console.log('🔍 loadProfile - _getUserHobbies response:', hobbyResponse)

        // Extract hobbies array from response object
        const hobbiesArray = hobbyResponse?.hobbies || hobbyResponse

        if (Array.isArray(hobbiesArray)) {
          hobbies.value = hobbiesArray.map((h) => h.hobby)
          activeHobbies.value = hobbiesArray.filter((h) => h.active).map((h) => h.hobby)
          console.log('✅ loadProfile - hobbies:', hobbies.value)
          console.log('✅ loadProfile - activeHobbies:', activeHobbies.value)
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
      console.error('Profile load error:', err)
    } finally {
      loading.value = false
    }
  }

  // Internal helper - profile creation should happen via backend sync after registration
  // This is kept for legacy/admin purposes only
  const createProfile = async () => {
    try {
      const response = await ApiService.callConceptAction<{} | { error: string }>(
        'UserProfile',
        'createProfile',
        {}, // Session token added automatically by ApiService
      )

      if ('error' in response) {
        // If profile already exists, that's ok - the sync already created it
        if (!response.error.includes('already exists')) {
          throw new Error(response.error)
        }
      }

      // Initialize empty profile
      profile.value = { name: '', image: '' }
      hobbies.value = []
    } catch (err: any) {
      console.warn('Manual profile creation failed:', err.message)
      // Don't throw - profile should be created by sync
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
      console.error('setName error:', err)
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
        { image }, // Backend sync expects 'image', not 'profile'
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
      console.error('setImage error:', err)
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
      console.log('🔍 setHobby - _getUserHobbies response:', hobbyResponse)

      // Extract hobbies array from response object
      const hobbiesArray = hobbyResponse?.hobbies || hobbyResponse

      if (Array.isArray(hobbiesArray)) {
        // Response is array of objects with {hobby, active}
        console.log('🔍 First hobby object:', hobbiesArray[0])
        console.log('🔍 hobbiesArray structure:', hobbiesArray)

        hobbies.value = hobbiesArray.map((h) => h.hobby)
        activeHobbies.value = hobbiesArray.filter((h) => h.active).map((h) => h.hobby)

        console.log('✅ setHobby - Updated hobbies:', hobbies.value)
        console.log('✅ setHobby - Updated activeHobbies:', activeHobbies.value)
      }
    } catch (err: any) {
      console.error('setHobby error:', err)
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
      console.error('closeHobby error:', err)
      error.value = err.message || 'Failed to close hobby'
      throw err
    } finally {
      loading.value = false
    }
  }

  const clearProfile = () => {
    profile.value = null
    hobbies.value = []
    currentUserId.value = null
    error.value = null
  }

  return {
    // State
    profile,
    hobbies,
    activeHobbies,
    currentUserId,
    loading,
    error,

    // Computed
    hasProfile,

    // Actions
    loadProfile,
    createProfile,
    setName,
    setImage,
    setHobby,
    closeHobby,
    clearProfile,
    setHobbyActive,
    setHobbyInactive,
  }
})
