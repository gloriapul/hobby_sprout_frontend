import { ref, computed } from 'vue'
import { defineStore } from 'pinia'
import { ApiService } from '@/services/api'

interface Goal {
  id: string
  description: string
  isActive: boolean
}

interface Step {
  id: string
  description: string
  start: string
  completion?: string
  isComplete: boolean
}

export const useMilestoneStore = defineStore('milestone', () => {
  // State
  const goals = ref<Goal[]>([])
  const currentGoal = ref<Goal | null>(null)
  const steps = ref<Step[]>([])
  const loading = ref(false)
  const error = ref<string | null>(null)

  // Computed
  const currentGoalSteps = computed(() => {
    if (!currentGoal.value) return []
    return steps.value.sort((a, b) => new Date(a.start).getTime() - new Date(b.start).getTime())
  })

  const goalProgress = computed(() => {
    if (currentGoalSteps.value.length === 0) return 0
    const completedSteps = currentGoalSteps.value.filter((step) => step.isComplete).length
    return Math.round((completedSteps / currentGoalSteps.value.length) * 100)
  })

  // Actions
  const loadUserGoals = async (userId: string) => {
    loading.value = true
    error.value = null

    try {
      const response = await ApiService.callConceptAction<Goal[] | { error: string }>(
        'MilestoneTracker',
        '_getGoal',
        { user: userId },
      )

      if ('error' in response) {
        throw new Error(response.error)
      }

      if (Array.isArray(response)) {
        goals.value = response
        // Set current goal to the active one
        currentGoal.value = response.find((g) => g.isActive) || null
      }
    } catch (err: any) {
      error.value = err.message || 'Failed to load goals'
      console.error('Goals load error:', err)
    } finally {
      loading.value = false
    }
  }

  const createGoal = async (userId: string, description: string) => {
    loading.value = true
    error.value = null

    try {
      const response = await ApiService.callConceptAction<{ goal: string } | { error: string }>(
        'MilestoneTracker',
        'createGoal',
        { user: userId, description },
      )

      if ('error' in response) {
        throw new Error(response.error)
      }

      // Add the new goal to our list
      const newGoal: Goal = {
        id: response.goal,
        description,
        isActive: true,
      }

      goals.value.push(newGoal)
      currentGoal.value = newGoal
      return newGoal
    } catch (err: any) {
      error.value = err.message || 'Failed to create goal'
      throw err
    } finally {
      loading.value = false
    }
  }

  const loadGoal = async (goalId: string) => {
    loading.value = true
    error.value = null

    try {
      // Find goal in current goals list
      const goal = goals.value.find((g) => g.id === goalId)
      if (goal) {
        currentGoal.value = goal
        await loadGoalSteps(goalId)
      } else {
        throw new Error('Goal not found')
      }
    } catch (err: any) {
      error.value = err.message || 'Failed to load goal'
      throw err
    } finally {
      loading.value = false
    }
  }

  const loadGoalSteps = async (goalId: string) => {
    try {
      const response = await ApiService.callConceptAction<Step[] | { error: string }>(
        'MilestoneTracker',
        '_getSteps',
        { goal: goalId },
      )

      if ('error' in response) {
        throw new Error(response.error)
      }

      if (Array.isArray(response)) {
        steps.value = response
      }
    } catch (err: any) {
      console.error('Failed to load steps:', err)
    }
  }

  const generateSteps = async (goalId: string) => {
    loading.value = true
    error.value = null

    try {
      const response = await ApiService.callConceptAction<{ steps: string[] } | { error: string }>(
        'MilestoneTracker',
        'generateSteps',
        { goal: goalId },
      )

      if ('error' in response) {
        throw new Error(response.error)
      }

      // Reload steps after generation
      await loadGoalSteps(goalId)
    } catch (err: any) {
      error.value = err.message || 'Failed to generate steps'
      throw err
    } finally {
      loading.value = false
    }
  }

  const addStep = async (goalId: string, description: string) => {
    loading.value = true
    error.value = null

    try {
      const response = await ApiService.callConceptAction<{ step: string } | { error: string }>(
        'MilestoneTracker',
        'addStep',
        { goal: goalId, description },
      )

      if ('error' in response) {
        throw new Error(response.error)
      }

      // Add the new step to our list
      const newStep: Step = {
        id: response.step,
        description,
        start: new Date().toISOString(),
        isComplete: false,
      }

      steps.value.push(newStep)
    } catch (err: any) {
      error.value = err.message || 'Failed to add step'
      throw err
    } finally {
      loading.value = false
    }
  }

  const completeStep = async (stepId: string) => {
    loading.value = true
    error.value = null

    try {
      const response = await ApiService.callConceptAction<{} | { error: string }>(
        'MilestoneTracker',
        'completeStep',
        { step: stepId },
      )

      if ('error' in response) {
        throw new Error(response.error)
      }

      // Update the step in our list
      const step = steps.value.find((s) => s.id === stepId)
      if (step) {
        step.isComplete = true
        step.completion = new Date().toISOString()
      }
    } catch (err: any) {
      error.value = err.message || 'Failed to complete step'
      throw err
    } finally {
      loading.value = false
    }
  }

  const deleteGoal = async (goalId: string) => {
    loading.value = true
    error.value = null

    try {
      const response = await ApiService.callConceptAction<{} | { error: string }>(
        'MilestoneTracker',
        'closeGoal',
        { goal: goalId },
      )

      if ('error' in response) {
        throw new Error(response.error)
      }

      // Update the goal in our list
      const goal = goals.value.find((g) => g.id === goalId)
      if (goal) {
        goal.isActive = false
      }

      if (currentGoal.value?.id === goalId) {
        currentGoal.value = null
        steps.value = []
      }
    } catch (err: any) {
      error.value = err.message || 'Failed to close goal'
      throw err
    } finally {
      loading.value = false
    }
  }

  const removeStep = async (stepId: string) => {
    loading.value = true
    error.value = null

    try {
      const response = await ApiService.callConceptAction<{} | { error: string }>(
        'MilestoneTracker',
        'removeStep',
        { step: stepId },
      )

      if ('error' in response) {
        throw new Error(response.error)
      }

      // Remove the step from our list
      steps.value = steps.value.filter((s) => s.id !== stepId)
    } catch (err: any) {
      error.value = err.message || 'Failed to remove step'
      throw err
    } finally {
      loading.value = false
    }
  }

  const closeGoal = async (goalId: string) => {
    return deleteGoal(goalId) // Alias for deleteGoal
  }

  const clearMilestones = () => {
    goals.value = []
    currentGoal.value = null
    steps.value = []
    error.value = null
  }

  return {
    // State
    goals,
    currentGoal,
    steps,
    loading,
    error,

    // Computed
    currentGoalSteps,
    goalProgress,

    // Actions
    createGoal,
    loadUserGoals,
    loadGoal,
    loadGoalSteps,
    generateSteps,
    addStep,
    completeStep,
    removeStep,
    closeGoal,
    deleteGoal,
    clearMilestones,
  }
})
