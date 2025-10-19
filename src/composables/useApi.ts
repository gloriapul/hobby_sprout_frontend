import { ref, type Ref } from 'vue'
import type { ApiResponse, ApiError } from '@/types'
import { isApiError } from '@/types'

/**
 * Composable for handling API requests with loading and error states
 */
export function useApi<T>() {
  const loading: Ref<boolean> = ref(false)
  const error: Ref<string | null> = ref(null)
  const data: Ref<T | null> = ref(null)

  const execute = async (apiCall: () => Promise<ApiResponse<T>>): Promise<T | null> => {
    loading.value = true
    error.value = null
    data.value = null

    try {
      const response = await apiCall()

      if (isApiError(response)) {
        error.value = response.error
        return null
      }

      data.value = response
      return response
    } catch (err: any) {
      error.value = err.message || 'An unexpected error occurred'
      return null
    } finally {
      loading.value = false
    }
  }

  const reset = () => {
    loading.value = false
    error.value = null
    data.value = null
  }

  return {
    loading,
    error,
    data,
    execute,
    reset,
  }
}

/**
 * Composable for handling async operations with toast notifications
 */
export function useAsyncOperation() {
  const loading = ref(false)
  const error = ref<string | null>(null)

  const execute = async <T>(
    operation: () => Promise<T>,
    options?: {
      onSuccess?: (result: T) => void
      onError?: (error: Error) => void
      successMessage?: string
      errorMessage?: string
    },
  ): Promise<T | null> => {
    loading.value = true
    error.value = null

    try {
      const result = await operation()

      if (options?.onSuccess) {
        options.onSuccess(result)
      }

      if (options?.successMessage) {
        // You can integrate with a toast library here
        console.log(options.successMessage)
      }

      return result
    } catch (err: any) {
      const errorMessage = options?.errorMessage || err.message || 'An error occurred'
      error.value = errorMessage

      if (options?.onError) {
        options.onError(err)
      }

      console.error(errorMessage)
      return null
    } finally {
      loading.value = false
    }
  }

  return {
    loading,
    error,
    execute,
  }
}
