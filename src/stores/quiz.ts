import { ref, computed } from 'vue'
import { defineStore } from 'pinia'
import { ApiService } from '@/services/api'

interface Question {
  id: string
  text: string
  options: string[]
}

interface QuizResponse {
  question: string
  response: string
}

interface HobbyMatch {
  hobby: string
  score: number
  description?: string
}

export const useQuizStore = defineStore('quiz', () => {
  // State
  const questions = ref<Question[]>([])
  const currentQuestionIndex = ref(0)
  const responses = ref<QuizResponse[]>([])
  const hobbyMatches = ref<HobbyMatch[]>([])
  const loading = ref(false)
  const error = ref<string | null>(null)
  const quizCompleted = ref(false)

  // Computed
  const currentQuestion = computed(() => {
    return questions.value[currentQuestionIndex.value] || null
  })

  const totalQuestions = computed(() => questions.value.length)

  const progress = computed(() => {
    if (totalQuestions.value === 0) return 0
    return Math.round((currentQuestionIndex.value / totalQuestions.value) * 100)
  })

  const canGoNext = computed(() => {
    return currentQuestionIndex.value < questions.value.length - 1
  })

  const canGoPrevious = computed(() => {
    return currentQuestionIndex.value > 0
  })

  const hasResponded = computed(() => {
    return responses.value.some((r) => r.question === currentQuestion.value?.id)
  })

  // Actions
  const loadQuestions = async () => {
    loading.value = true
    error.value = null

    try {
      const response = await ApiService.callConceptAction<Question[] | { error: string }>(
        'QuizMatchmaker',
        '_getQuestions',
        {},
      )

      if ('error' in response) {
        throw new Error(response.error)
      }

      if (Array.isArray(response)) {
        questions.value = response
        currentQuestionIndex.value = 0
        quizCompleted.value = false
      }
    } catch (err: any) {
      error.value = err.message || 'Failed to load quiz questions'
      console.error('Questions load error:', err)
    } finally {
      loading.value = false
    }
  }

  const submitResponse = async (questionId: string, responseText: string) => {
    loading.value = true
    error.value = null

    try {
      const response = await ApiService.callConceptAction<{} | { error: string }>(
        'QuizMatchmaker',
        'submitResponse',
        { question: questionId, response: responseText },
      )

      if ('error' in response) {
        throw new Error(response.error)
      }

      // Store the response locally
      const existingResponseIndex = responses.value.findIndex((r) => r.question === questionId)
      if (existingResponseIndex >= 0) {
        responses.value[existingResponseIndex]!.response = responseText
      } else {
        responses.value.push({
          question: questionId,
          response: responseText,
        })
      }
    } catch (err: any) {
      error.value = err.message || 'Failed to submit response'
      throw err
    } finally {
      loading.value = false
    }
  }

  const generateHobbyMatch = async () => {
    loading.value = true
    error.value = null

    try {
      const response = await ApiService.callConceptAction<
        { hobby: string; score: number } | { error: string }
      >('QuizMatchmaker', 'generateHobbyMatch', {})

      if ('error' in response) {
        throw new Error(response.error)
      }

      hobbyMatches.value = [
        {
          hobby: response.hobby,
          score: response.score,
        },
      ]

      quizCompleted.value = true
    } catch (err: any) {
      error.value = err.message || 'Failed to generate hobby match'
      throw err
    } finally {
      loading.value = false
    }
  }

  const nextQuestion = () => {
    if (canGoNext.value) {
      currentQuestionIndex.value++
    }
  }

  const previousQuestion = () => {
    if (canGoPrevious.value) {
      currentQuestionIndex.value--
    }
  }

  const goToQuestion = (index: number) => {
    if (index >= 0 && index < questions.value.length) {
      currentQuestionIndex.value = index
    }
  }

  const getCurrentResponse = (questionId: string) => {
    return responses.value.find((r) => r.question === questionId)?.response || ''
  }

  const restartQuiz = () => {
    currentQuestionIndex.value = 0
    responses.value = []
    hobbyMatches.value = []
    quizCompleted.value = false
    error.value = null
  }

  const clearQuiz = () => {
    questions.value = []
    currentQuestionIndex.value = 0
    responses.value = []
    hobbyMatches.value = []
    loading.value = false
    error.value = null
    quizCompleted.value = false
  }

  return {
    // State
    questions,
    currentQuestionIndex,
    responses,
    hobbyMatches,
    loading,
    error,
    quizCompleted,

    // Computed
    currentQuestion,
    totalQuestions,
    progress,
    canGoNext,
    canGoPrevious,
    hasResponded,

    // Actions
    loadQuestions,
    submitResponse,
    generateHobbyMatch,
    nextQuestion,
    previousQuestion,
    goToQuestion,
    getCurrentResponse,
    restartQuiz,
    clearQuiz,
  }
})
