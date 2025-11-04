import { ref, computed } from 'vue'
import { defineStore } from 'pinia'
import { ApiService } from '@/services/api'

interface Goal {
  id: string
  description: string
  isActive: boolean
  hobby: string
  completed?: boolean
  createdAt?: string
}

interface Step {
  id: string
  description: string
  start: string
  completion?: string
  isComplete: boolean
}

export const useMilestoneStore = defineStore('milestone', () => {
  // Clear current goal and steps
  const clearCurrentGoal = () => {
    currentGoal.value = null
    steps.value = []
  }
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
  const loadUserGoals = async () => {
    loading.value = true
    error.value = null

    try {
      // Use getGoals endpoint to fetch all user goals
      const response = await ApiService.callConceptAction<any>('MilestoneTracker', '_getGoals', {})
      console.log('DEBUG _getGoals response:', response)
      const goalsArray = Array.isArray(response.goals) ? response.goals : []
      goals.value = goalsArray.map((g: any) => ({
        id: g.goalId || g.id,
        description: g.goalDescription || g.description,
        hobby: g.goalHobby || g.hobby,
        isActive: g.goalIsActive ?? g.isActive ?? true,
        completed: g.completed ?? false,
        createdAt: g.createdAt ?? new Date().toISOString(),
      }))
      console.log('DEBUG mapped goals:', goals.value)
      // Set currentGoal to the first active, not completed goal
      const activeGoal = goals.value.find((g) => g.isActive && !g.completed)
      currentGoal.value = activeGoal || null
    } catch (err: any) {
      error.value = err.message || 'Failed to load goals'
      console.error('Goals load error:', err)
    } finally {
      loading.value = false
    }
  }

  const createGoal = async (description: string, hobby: string) => {
    loading.value = true
    error.value = null

    try {
      console.log('[createGoal] Sending request:', { description, hobby })
      const response = await ApiService.callConceptAction<{ goal: string } | { error: string }>(
        'MilestoneTracker',
        'createGoal',
        { description, hobby },
      )
      console.log('[createGoal] Received response:', response)

      if ('error' in response) {
        throw new Error(response.error)
      }

      // Mark all other completed goals as not active
      goals.value.forEach((g) => {
        if (g.completed) g.isActive = false
      })
      // Add the new goal to our list (local optimistic update)
      const newGoal: Goal = {
        id: response.goal,
        description,
        isActive: true,
        hobby,
        completed: false,
        createdAt: new Date().toISOString(),
      }

      goals.value.push(newGoal)
      currentGoal.value = newGoal
      // Reload all goals from backend to ensure state is up to date
      await loadUserGoals()
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
      const response = await ApiService.callConceptAction<any>('MilestoneTracker', '_getSteps', {
        goalId,
      })

      console.log('🔍 loadGoalSteps - _getSteps response for goalId', goalId, ':', response)

      if ('error' in response) {
        throw new Error(response.error)
      }

      // Extract steps array from response object
      const stepsArray = response?.steps || response
      if (Array.isArray(stepsArray)) {
        steps.value = stepsArray
        console.log('✅ loadGoalSteps - loaded', stepsArray.length, 'steps:', stepsArray)
        // Debug: print isComplete for each step
        stepsArray.forEach((s, i) =>
          console.log(`Step[${i}] id=${s.id} isComplete=${s.isComplete}`),
        )
        // Check if all steps for this goal are complete and update completed status
        const allComplete = steps.value.length > 0 && steps.value.every((s) => s.isComplete)
        const goal = goals.value.find((g) => g.id === goalId)
        if (goal) goal.completed = allComplete
      } else {
        console.warn('Steps response is not an array:', stepsArray)
      }
    } catch (err: any) {
      console.error('Failed to load steps:', err)
    }
  }

  const generateSteps = async (goalId: string) => {
    console.log('🔍 generateSteps called with goalId:', goalId)
    loading.value = true
    error.value = null

    try {
      const response = await ApiService.callConceptAction<{ steps: string[] } | { error: string }>(
        'MilestoneTracker',
        'generateSteps',
        { goalId },
      )

      console.log('📊 generateSteps response:', response)

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
        { goalId, description },
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

  // Regenerate steps for a goal
  const regenerateSteps = async (goalId: string) => {
    loading.value = true
    error.value = null
    try {
      const response = await ApiService.callConceptAction<{ steps: string[] } | { error: string }>(
        'MilestoneTracker',
        'regenerateSteps',
        { goalId },
      )
      if ('error' in response) {
        throw new Error(response.error)
      }
      // Reload steps after regeneration
      await loadGoalSteps(goalId)
    } catch (err: any) {
      error.value = err.message || 'Failed to regenerate steps'
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
        { stepId },
      )

      if ('error' in response) {
        throw new Error(response.error)
      }

      // After completing a step, reload steps from backend to ensure state is in sync
      if (currentGoal.value) {
        await loadGoalSteps(currentGoal.value.id)
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
        { goalId },
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

      // After closing a goal, reload all goals (not just active)
      await loadUserGoals()
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
        { stepId },
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
    regenerateSteps,
    completeStep,
    removeStep,
    closeGoal,
    deleteGoal,
    clearMilestones,
    clearCurrentGoal,
  }
})
