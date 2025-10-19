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
  const currentUserId = ref<string | null>(null)
  const loading = ref(false)
  const error = ref<string | null>(null)

  // Computed
  const hasProfile = computed(() => profile.value !== null)

  // Actions
  const loadProfile = async (userId: string) => {
    loading.value = true
    error.value = null
    currentUserId.value = userId

    try {
      const response = await ApiService.callConceptAction<any[]>('UserProfile', '_getUserProfile', {
        user: userId,
      })

      if (Array.isArray(response) && response.length > 0) {
        // The response is an array with profile data
        const profileData = response[0]
        profile.value = {
          name: profileData.displayname || '',
          image: profileData.profile || '',
        }
      } else {
        console.log('Profile not found, trying to create one...')
        // Profile doesn't exist yet, try to create one
        try {
          await createProfile()
        } catch (createError: any) {
          // If creation fails because profile already exists, that's ok
          if (!createError.message?.includes('already exists')) {
            throw createError
          }
          console.log('Profile already exists, initializing empty profile state')
          // Initialize empty profile state since we couldn't load it
          profile.value = { name: '', image: '' }
        }
      }
    } catch (err: any) {
      error.value = err.message || 'Failed to load profile'
      console.error('Profile load error:', err)
    } finally {
      loading.value = false
    }
  }

  const createProfile = async () => {
    if (!currentUserId.value) {
      throw new Error('No user ID available')
    }

    try {
      const response = await ApiService.callConceptAction<{} | { error: string }>(
        'UserProfile',
        'createProfile',
        { user: currentUserId.value },
      )

      if ('error' in response) {
        throw new Error(response.error)
      }

      // Initialize empty profile
      profile.value = { name: '', image: '' }
      hobbies.value = []
    } catch (err: any) {
      error.value = err.message || 'Failed to create profile'
      throw err
    }
  }

  const setName = async (name: string) => {
    console.log('setName called with:', name)
    console.log('currentUserId:', currentUserId.value)

    if (!currentUserId.value) {
      throw new Error('No user ID available')
    }

    loading.value = true
    error.value = null

    try {
      console.log('Making API call to setName with:', {
        user: currentUserId.value,
        displayname: name,
      })

      const response = await ApiService.callConceptAction<{} | { error: string }>(
        'UserProfile',
        'setName',
        { user: currentUserId.value, displayname: name },
      )

      console.log('API response:', response)

      if ('error' in response) {
        // If profile doesn't exist, create it first then retry
        if (response.error.includes('not found')) {
          console.log('Profile not found, creating profile and retrying...')
          await createProfile()

          // Retry the setName call
          const retryResponse = await ApiService.callConceptAction<{} | { error: string }>(
            'UserProfile',
            'setName',
            { user: currentUserId.value, displayname: name },
          )

          if ('error' in retryResponse) {
            throw new Error(retryResponse.error)
          }
        } else {
          throw new Error(response.error)
        }
      }

      // Update local state
      if (!profile.value) {
        profile.value = { name: '', image: '' }
      }
      profile.value.name = name

      console.log('Name successfully updated to:', name)
    } catch (err: any) {
      console.error('setName error:', err)
      error.value = err.message || 'Failed to set name'
      throw err
    } finally {
      loading.value = false
    }
  }

  const setImage = async (image: string) => {
    if (!currentUserId.value) {
      throw new Error('No user ID available')
    }

    loading.value = true
    error.value = null

    try {
      const response = await ApiService.callConceptAction<{} | { error: string }>(
        'UserProfile',
        'setImage',
        { user: currentUserId.value, image },
      )

      if ('error' in response) {
        throw new Error(response.error)
      }

      if (profile.value) {
        profile.value.image = image
      }
    } catch (err: any) {
      error.value = err.message || 'Failed to set image'
      throw err
    } finally {
      loading.value = false
    }
  }
  const setHobby = async (hobby: string) => {
    if (!currentUserId.value) {
      throw new Error('No user ID available')
    }

    loading.value = true
    error.value = null

    try {
      const response = await ApiService.callConceptAction<{} | { error: string }>(
        'UserProfile',
        'setHobby',
        { user: currentUserId.value, hobby },
      )

      if ('error' in response) {
        throw new Error(response.error)
      }

      if (!hobbies.value.includes(hobby)) {
        hobbies.value.push(hobby)
      }
    } catch (err: any) {
      error.value = err.message || 'Failed to set hobby'
      throw err
    } finally {
      loading.value = false
    }
  }

  const closeHobby = async (hobby: string) => {
    if (!currentUserId.value) {
      throw new Error('No user ID available')
    }

    loading.value = true
    error.value = null

    try {
      const response = await ApiService.callConceptAction<{} | { error: string }>(
        'UserProfile',
        'closeHobby',
        { user: currentUserId.value, hobby },
      )

      if ('error' in response) {
        throw new Error(response.error)
      }

      hobbies.value = hobbies.value.filter((h) => h !== hobby)
    } catch (err: any) {
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
  }
})
