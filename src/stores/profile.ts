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
  const currentUserId = ref<string | null>(null)
  const loading = ref(false)
  const error = ref<string | null>(null)

  // Computed
  const hasProfile = computed(() => profile.value !== null)

  // Actions
  // Toggle hobby active/inactive, will work on for rest of assignment
  async function setHobbyActive(hobby: string) {
    if (!currentUserId.value) throw new Error('No user ID available')
    loading.value = true
    error.value = null
    try {
      await ApiService.callConceptAction('UserProfile', 'setHobby', {
        hobby,
      })
      await loadProfile(currentUserId.value)
    } catch (err: any) {
      error.value = err.message || 'Failed to activate hobby'
      throw err
    } finally {
      loading.value = false
    }
  }

  async function setHobbyInactive(hobby: string) {
    if (!currentUserId.value) throw new Error('No user ID available')
    loading.value = true
    error.value = null
    try {
      await ApiService.callConceptAction('UserProfile', 'closeHobby', {
        hobby,
      })
      await loadProfile(currentUserId.value)
    } catch (err: any) {
      error.value = err.message || 'Failed to deactivate hobby'
      throw err
    } finally {
      loading.value = false
    }
  }
  const loadProfile = async (userId: string) => {
    loading.value = true
    error.value = null
    currentUserId.value = userId

    try {
      const response = await ApiService.callConceptAction<any[]>(
        'UserProfile',
        '_getUserProfile',
        {},
      )

      if (Array.isArray(response) && response.length > 0) {
        // The response is an array with profile data
        const profileData = response[0]
        profile.value = {
          name: profileData.displayname || '',
          image: profileData.profile || '',
        }
        // Load all hobbies (active and inactive) after profile loads
        try {
          const hobbyResponse = await ApiService.callConceptAction<any[]>(
            'UserProfile',
            '_getUserHobbies',
            {},
          )
          if (Array.isArray(hobbyResponse)) {
            hobbies.value = hobbyResponse.map((h) => h.hobby)
            activeHobbies.value = hobbyResponse.filter((h) => h.active).map((h) => h.hobby)
          }
        } catch (hobbyError) {
          console.error('Failed to load active hobbies:', hobbyError)
          hobbies.value = []
        }
      } else {
        // Profile doesn't exist yet, try to create one
        try {
          await createProfile()
        } catch (createError: any) {
          // If creation fails because profile already exists, that's ok
          if (!createError.message?.includes('already exists')) {
            throw createError
          }
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
        {},
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
    if (!currentUserId.value) {
      throw new Error('No user ID available')
    }

    loading.value = true
    error.value = null

    try {
      const response = await ApiService.callConceptAction<{} | { error: string }>(
        'UserProfile',
        'setName',
        { displayname: name },
      )
      if ('error' in response) {
        // If profile doesn't exist, create it first then retry
        if (response.error.includes('not found')) {
          await createProfile()

          // Retry the setName call
          const retryResponse = await ApiService.callConceptAction<{} | { error: string }>(
            'UserProfile',
            'setName',
            { displayname: name },
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
        { profile: image },
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
        { hobby },
      )

      if ('error' in response) {
        throw new Error(response.error)
      }

      // Always reload active hobbies from backend after adding
      try {
        const hobbyResponse = await ApiService.callConceptAction<any[]>(
          'UserProfile',
          '_getActiveHobbies',
          {},
        )
        if (Array.isArray(hobbyResponse)) {
          if (
            hobbyResponse.length > 0 &&
            typeof hobbyResponse[0] === 'object' &&
            'hobby' in hobbyResponse[0]
          ) {
            hobbies.value = hobbyResponse.filter((h) => h.active).map((h) => h.hobby)
          } else {
            hobbies.value = hobbyResponse.filter((h) => typeof h === 'string')
          }
        }
      } catch (hobbyError) {
        console.error('Failed to reload active hobbies:', hobbyError)
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
        { hobby },
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
