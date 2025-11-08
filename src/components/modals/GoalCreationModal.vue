<template>
  <div class="modal-overlay" @click="step === 1 || generationError ? handleClose() : null">
    <div class="modal-content" @click.stop>
      <div class="modal-header">
        <h2>Create New Goal</h2>
        <button v-if="step === 1 || generationError" @click="handleClose" class="close-button">
          ×
        </button>
      </div>
      <div class="modal-body">
        <div v-if="step === 1" class="step-content">
          <label for="goalDescription">Goal Description</label>
          <textarea
            id="goalDescription"
            v-model="goalDescription"
            placeholder="Describe your goal..."
            rows="4"
            required
          ></textarea>
          <div class="form-help">Be specific! E.g. "Learn to play 5 songs on guitar"</div>
          <div v-if="generationError" class="error-message" style="margin-top: 1rem">
            {{ generationError }}
          </div>
          <div class="choose-method">
            <button
              @click="chooseMethod('generate')"
              :disabled="!goalDescription.trim() || generating"
              class="next-button"
            >
              <span v-if="generating && method === 'generate'" class="button-spinner"></span>
              <span v-else>Generate Steps</span>
            </button>
            <button
              @click="chooseMethod('manual')"
              :disabled="!goalDescription.trim() || generating"
              class="next-button"
            >
              <span v-if="generating && method === 'manual'" class="button-spinner"></span>
              <span v-else>Enter Steps Manually</span>
            </button>
          </div>
        </div>
        <div v-else-if="step === 2 && method === 'generate'" class="step-content">
          <div v-if="generating" class="generating-steps">
            <div class="loading-spinner"></div>
            <h3>Generating Steps...</h3>
          </div>
          <div v-else>
            <h3>Review & Approve Steps</h3>
            <div v-if="generationError" class="error-message" style="margin-bottom: 1rem">
              {{ generationError }}
            </div>
            <draggable
              v-model="steps"
              class="steps-list"
              item-key="id"
              :animation="200"
              handle=".drag-handle"
            >
              <template #item="{ element: step, index: idx }">
                <li>
                  <span
                    class="drag-handle"
                    title="Drag to reorder"
                    style="cursor: grab; margin-right: 0.5em"
                    >☰</span
                  >
                  <input
                    v-model="step.description"
                    class="edit-step-input"
                    :placeholder="`Step ${idx + 1}`"
                    @input="validationError = ''"
                    style="flex: 1; margin-right: 0.5em; min-width: 0"
                  />
                  <button @click="removeStep(idx)" class="delete-step">Delete</button>
                </li>
              </template>
            </draggable>
            <div class="form-actions">
              <label for="manualStepGen" class="form-label">Add Step</label>
              <textarea
                id="manualStepGen"
                v-model="manualStepInput"
                class="form-textarea"
                placeholder="Describe what needs to be done for this step..."
                rows="3"
              ></textarea>
              <span v-if="validationError" class="error-message">{{ validationError }}</span>
              <button
                type="button"
                @click="handleAddStep"
                :disabled="generating || !manualStepInput.trim()"
                class="next-button"
              >
                Add Manual Step
              </button>
            </div>
            <button @click="saveGoal" :disabled="steps.length === 0" class="primary-button">
              Save Goal & Steps
            </button>
            <button @click="onRegenerateClick" class="secondary-button" :disabled="generating">
              Generate Steps
            </button>
          </div>
        </div>
        <div v-else-if="step === 2 && method === 'manual'" class="step-content">
          <h3>Enter Steps Manually</h3>
          <form @submit.prevent="handleAddStep" class="step-form">
            <div class="form-group">
              <label for="manualStep" class="form-label">Step Description</label>
              <textarea
                id="manualStep"
                v-model="manualStepInput"
                class="form-textarea"
                placeholder="Describe what needs to be done for this step..."
                rows="3"
                required
                @input="validationError = ''"
              ></textarea>
              <span v-if="validationError" class="error-message">{{ validationError }}</span>
            </div>
            <div class="form-actions">
              <button type="submit" class="next-button" :disabled="!!validationError">
                Add Manual Step
              </button>
            </div>
          </form>
          <draggable
            v-model="steps"
            class="steps-list"
            item-key="id"
            :animation="200"
            handle=".drag-handle"
          >
            <template #item="{ element: step, index: idx }">
              <li>
                <span
                  class="drag-handle"
                  title="Drag to reorder"
                  style="cursor: grab; margin-right: 0.5em"
                  >☰</span
                >
                {{ step.description }}
                <button @click="removeStep(idx)" class="delete-step">Delete</button>
              </li>
            </template>
          </draggable>
          <button @click="saveGoal" :disabled="steps.length === 0" class="primary-button">
            Save Goal & Steps
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { onMounted, onUnmounted } from 'vue'
// Retry logic: if no goal, retry creation; if goal exists, regenerate steps
async function onRegenerateClick() {
  generationError.value = ''
  // Always fetch the current active goal for this hobby and use its ID
  const { ApiService } = await import('@/services/api')
  const userId = authStore.user?.id
  let goalId = null
  if (userId && props.hobby) {
    const existingGoalsResponse = await ApiService.callConceptAction<any>(
      'MilestoneTracker',
      '_getGoal',
      {
        user: userId,
        hobby: props.hobby,
      },
    )
    // Support both array and {goals: array} response
    const goalsArray = Array.isArray(existingGoalsResponse.goals)
      ? existingGoalsResponse.goals
      : Array.isArray(existingGoalsResponse)
        ? existingGoalsResponse
        : []
    type GoalObj = { goalId?: string; id?: string; goalIsActive?: boolean }
    if (goalsArray.length > 0) {
      // Find the active goal
      const activeGoal = goalsArray.find((g: GoalObj) => g.goalIsActive === true)
      if (activeGoal) {
        goalId = activeGoal.goalId || activeGoal.id
      }
    }
  }
  if (!goalId) {
    generationError.value = 'No goal to regenerate steps for.'
    return
  }
  try {
    await milestoneStore.regenerateSteps(goalId)
    await new Promise((resolve) => setTimeout(resolve, 2000))
    await milestoneStore.loadGoalSteps(goalId)
    steps.value = milestoneStore.steps.map((s, index) => ({
      id: s.id || index,
      description: s.description,
    }))
  } catch (err) {
    generationError.value = 'Failed to regenerate steps. Please try again.'
    steps.value = []
  }
}
import { ref } from 'vue'
import draggable from 'vuedraggable'
import { useAuthStore } from '@/stores/auth'
import { useMilestoneStore } from '@/stores/milestone'

// Props and Emits

// Hide background when modal is open
onMounted(() => {
  document.body.classList.add('modal-open')
})
onUnmounted(() => {
  document.body.classList.remove('modal-open')
})
const props = defineProps<{ hobby: string }>()
const emit = defineEmits(['close', 'goalCreated'])

// Store instances
const authStore = useAuthStore()
const milestoneStore = useMilestoneStore()

// Component State
const step = ref(1)
const method = ref<'generate' | 'manual' | null>(null)
const goalDescription = ref('')
const steps = ref<{ id: string | number; description: string }[]>([])
const manualStepInput = ref('')
const validationError = ref('')
const generationError = ref('')
const generating = ref(false)
const goalIdRef = ref<string | null>(null)

// Functions

function resetModalState() {
  step.value = 1
  method.value = null
  goalDescription.value = ''
  steps.value = []
  manualStepInput.value = ''
  validationError.value = ''
  generationError.value = ''
  generating.value = false
  goalIdRef.value = null
}

function handleClose() {
  resetModalState()
  emit('close')
}

async function chooseMethod(selected: 'generate' | 'manual') {
  if (!goalDescription.value.trim()) {
    validationError.value = 'Goal description is required.'
    return
  }
  validationError.value = ''
  generationError.value = ''
  method.value = selected
  generating.value = true
  steps.value = []

  try {
    const { ApiService } = await import('@/services/api')
    const userId = authStore.user?.id
    if (!userId) throw new Error('User not found')

    const existingGoals = await ApiService.callConceptAction<any>('MilestoneTracker', '_getGoal', {
      user: userId,
      hobby: props.hobby,
    })
    if (Array.isArray(existingGoals) && existingGoals.length > 0) {
      // If generate is selected and a goal exists, regenerate steps for that goal
      if (selected === 'generate') {
        const goalId = existingGoals[0].goalId || existingGoals[0].id
        goalIdRef.value = goalId
        // Call regenerateSteps endpoint
        await ApiService.callConceptAction<any>('MilestoneTracker', 'regenerateSteps', {
          goal: goalId,
        })
        await new Promise((resolve) => setTimeout(resolve, 2000))
        const stepsResult = await ApiService.callConceptAction<any>(
          'MilestoneTracker',
          '_getSteps',
          {
            goal: goalId,
          },
        )
        const stepsArray = stepsResult?.steps || stepsResult
        if (stepsArray && Array.isArray(stepsArray) && stepsArray.length > 0) {
          steps.value = stepsArray.map((s: any, index: number) => ({
            id: s.id || index,
            description: s.description,
          }))
        } else {
          generationError.value = 'Could not retrieve regenerated steps.'
        }
        step.value = 2
        generating.value = false
        return
      } else {
        generationError.value =
          'You already have an active goal for this hobby. Please close it before creating a new one.'
        generating.value = false
        return
      }
    }

    const payload = {
      description: goalDescription.value,
      hobby: props.hobby,
      autoGenerate: selected === 'generate',
    }
    const goalResult = await ApiService.callConceptAction<any>(
      'MilestoneTracker',
      'createGoal',
      payload,
    )
    // Handle backend error for existing goal
    if (goalResult && typeof goalResult.error === 'string') {
      if (goalResult.error.includes('active goal already exists')) {
        // Fetch the existing goal and switch to regeneration mode
        const existingGoalsRetry = await ApiService.callConceptAction<any>(
          'MilestoneTracker',
          '_getGoal',
          {
            user: userId,
            hobby: props.hobby,
          },
        )
        if (Array.isArray(existingGoalsRetry) && existingGoalsRetry.length > 0) {
          const goalId = existingGoalsRetry[0].goalId || existingGoalsRetry[0].id
          goalIdRef.value = goalId
          await ApiService.callConceptAction<any>('MilestoneTracker', 'regenerateSteps', {
            goal: goalId,
          })
          await new Promise((resolve) => setTimeout(resolve, 2000))
          const stepsResult = await ApiService.callConceptAction<any>(
            'MilestoneTracker',
            '_getSteps',
            {
              goal: goalId,
            },
          )
          const stepsArray = stepsResult?.steps || stepsResult
          if (stepsArray && Array.isArray(stepsArray) && stepsArray.length > 0) {
            steps.value = stepsArray.map((s: any, index: number) => ({
              id: s.id || index,
              description: s.description,
            }))
          } else {
            generationError.value = 'Could not retrieve regenerated steps.'
          }
          step.value = 2
          generating.value = false
          return
        }
      }
      throw new Error(goalResult.error)
    }
    const goalId = goalResult.goalId
    if (!goalId) throw new Error('Failed to create goal.')
    goalIdRef.value = goalId

    step.value = 2

    if (selected === 'generate') {
      await new Promise((resolve) => setTimeout(resolve, 2000))
      const stepsResult = await ApiService.callConceptAction<any>('MilestoneTracker', '_getSteps', {
        goal: goalId,
      })
      const stepsArray = stepsResult?.steps || stepsResult
      if (stepsArray && Array.isArray(stepsArray) && stepsArray.length > 0) {
        steps.value = stepsArray.map((s: any, index: number) => ({
          id: s.id || index,
          description: s.description,
        }))
      } else {
        generationError.value = 'Could not retrieve generated steps.'
      }
    }
  } catch (err: any) {
    generationError.value = 'An error occurred. Please try again or manually enter steps.'
    step.value = 2
  } finally {
    generating.value = false
  }
}

function validateManualStep() {
  validationError.value = ''
  if (!manualStepInput.value.trim()) {
    validationError.value = 'Step description is required'
    return false
  }
  if (manualStepInput.value.trim().length < 10) {
    validationError.value = 'Step description should be at least 10 characters'
    return false
  }
  return true
}

function handleAddStep() {
  if (!validateManualStep()) return
  const stepText = manualStepInput.value.trim()
  // Prevent duplicate descriptions in UI
  if (steps.value.some((s) => s.description.trim() === stepText)) {
    validationError.value = 'This step already exists.'
    return
  }
  steps.value.push({ id: Date.now(), description: stepText })
  manualStepInput.value = ''
  validationError.value = ''
}

function removeStep(idx: number) {
  steps.value.splice(idx, 1)
}

async function saveGoal() {
  try {
    const goalId = goalIdRef.value
    if (!goalId) {
      generationError.value = 'Goal ID is missing. Cannot save steps. Please start over.'
      return
    }
    if (!steps.value || steps.value.length === 0) {
      validationError.value = 'You must add at least one step before saving your goal.'
      return
    }

    const { ApiService } = await import('@/services/api')

    const existingStepsResult = await ApiService.callConceptAction<any>(
      'MilestoneTracker',
      '_getSteps',
      { goal: goalId },
    )
    const existingSteps = existingStepsResult?.steps || existingStepsResult
    if (Array.isArray(existingSteps)) {
      for (const step of existingSteps) {
        const removeResult = await ApiService.callConceptAction<any>(
          'MilestoneTracker',
          'removeStep',
          {
            step: step.id,
          },
        )
      }
    }

    // Only add unique step descriptions to backend
    const uniqueSteps = Array.from(new Set(steps.value.map((s) => s.description.trim()))).map(
      (desc, idx) => ({ id: idx, description: desc }),
    )
    for (const step of uniqueSteps) {
      const addResult = await ApiService.callConceptAction<any>('MilestoneTracker', 'addStep', {
        goal: goalId,
        description: step.description,
      })
    }

    // Reload steps from backend to ensure no duplicates
    await milestoneStore.loadGoalSteps(goalId)
    // Filter backend steps to only unique descriptions
    const seen = new Set<string>()
    const uniqueBackendSteps = []
    for (const s of milestoneStore.steps) {
      const desc = s.description.trim()
      if (!seen.has(desc)) {
        seen.add(desc)
        uniqueBackendSteps.push({ id: s.id, description: desc })
      }
    }
    steps.value = uniqueBackendSteps
    emit('goalCreated', {
      description: goalDescription.value,
      steps: uniqueBackendSteps.map((s) => s.description),
      hobby: props.hobby,
    })
    steps.value = []
    resetModalState()
    emit('close')
  } catch (err: any) {
    generationError.value = 'Failed to save goal. Please try again or manually enter steps.'
  }
}

async function confirmRegenerateSteps() {
  if (!goalIdRef.value) {
    generationError.value = 'No goal to regenerate steps for.'
    return
  }
  generating.value = true
  // Always clear error state before attempting regeneration
  generationError.value = ''
  try {
    await milestoneStore.regenerateSteps(goalIdRef.value)
    await new Promise((resolve) => setTimeout(resolve, 2000))
    await milestoneStore.loadGoalSteps(goalIdRef.value)
    // Defensive: always clear error state after successful regeneration
    generationError.value = ''
    // Always update steps from store, even after previous errors
    const seen = new Set<string>()
    const uniqueSteps = []
    for (const s of milestoneStore.steps) {
      const desc = s.description.trim()
      if (!seen.has(desc)) {
        seen.add(desc)
        uniqueSteps.push({ id: s.id, description: desc })
      }
    }
    steps.value = uniqueSteps
  } catch (err: any) {
    generationError.value = 'Failed to regenerate steps. Please try again.'
    // Also clear steps if regeneration fails, to avoid stale UI
    steps.value = []
  } finally {
    generating.value = false
  }
}
</script>

<style scoped>
.error-message {
  color: #d32f2f;
  margin-top: 0.25em;
  background-color: #ffcdd2;
  border: 1px solid #d32f2f;
  border-radius: 8px;
  padding: 1rem;
  font-weight: 500;
}
.modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.5);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
  padding: 1rem;
}
.modal-content {
  background: #f6fff7;
  border-radius: 16px;
  width: 100%;
  max-width: 600px;
  max-height: 90vh;
  overflow-y: auto;
  border: 1.5px solid #81c784;
}
.modal-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 1.5rem 1.5rem 1rem 1.5rem;
  border-bottom: 1px solid #81c784;
  background: #e8f5e9;
  border-top-left-radius: 16px;
  border-top-right-radius: 16px;
}
.modal-header h2 {
  margin: 0;
  color: #256b28;
  font-size: 1.5rem;
  font-weight: 500;

  letter-spacing: 0.5px;
}
.close-button {
  background: none;
  border: none;
  font-size: 2rem;
  color: #256b28;
  cursor: pointer;
  width: 40px;
  height: 40px;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 50%;
  transition: background 0.2s;
}
.close-button:hover {
  background: #e0f2f1;
  color: #256b28;
}
.modal-body {
  padding: 1.5rem;
}
.modal-body label {
  color: #256b28;
  font-weight: 500;
  margin-bottom: 0.5rem;
  display: block;
}
.modal-body textarea,
.modal-body input {
  width: 100%;
  border-radius: 8px;
  border: 1.5px solid #81c784;
  padding: 0.75rem;
  margin-bottom: 0.5rem;
  font-size: 1rem;
  background: #f6fff7;
  color: #256b28;

  transition: border-color 0.2s;
}
.modal-body textarea:focus,
.modal-body input:focus {
  outline: none;
  border-color: #256b28;
}
.step-content h3 {
  margin: 0 0 0.5rem 0;
  color: #333;
  font-size: 1.3rem;
}
.form-help {
  color: #256b28;
  margin-bottom: 1rem;
  font-size: 0.95rem;
  background: #e8f5e9;
  padding: 0.5rem 1rem;
  border-radius: 8px;
}
.choose-method {
  display: flex;
  gap: 1rem;
  margin-top: 1rem;
}
.steps-list {
  list-style: none;
  padding: 0;
  margin: 1rem 0;
}
.steps-list li {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  margin-bottom: 0.5rem;
  background: #f6fff7;
  border-radius: 8px;
  padding: 0.5rem 1rem;
  border: 1px solid #e0f2f1;
  box-shadow: none;
}
.delete-step {
  background: #388e3c;
  color: #fff;
  border: none;
  border-radius: 6px;
  padding: 0.25rem 0.75rem;
  cursor: pointer;
  font-size: 0.95rem;

  font-weight: 500;
  transition: background 0.2s;
}
.delete-step:hover {
  background: #256b28;
}
.next-button,
.primary-button {
  background: #388e3c;
  color: #fff;
  border: none;
  padding: 0.85rem 1.5rem;
  border-radius: 8px;
  font-size: 1rem;
  cursor: pointer;
  font-weight: 500;
  box-shadow: none;
  transition: background 0.2s;
}
.next-button:disabled,
.primary-button:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}
.next-button:hover,
.primary-button:hover {
  background: #256b28;
}
.secondary-button {
  background: transparent;
  color: #388e3c;
  border: 2px solid #388e3c;
  padding: 0.75rem 1.5rem;
  border-radius: 8px;
  font-size: 1rem;
  cursor: pointer;
  margin: 10px;
  font-weight: 500;
  transition:
    background 0.2s,
    color 0.2s;
}
.secondary-button:hover {
  background: #388e3c;
  color: #fff;
}
.next-button {
  display: flex;
  align-items: center;
  justify-content: center;
  min-width: 150px; /* Ensure button doesn't shrink when showing spinner */
}

.button-spinner {
  width: 1.2em;
  height: 1.2em;
  border: 2px solid rgba(255, 255, 255, 0.5);
  border-top: 2px solid white;
  border-radius: 50%;
  display: inline-block;
  animation: spin 1s linear infinite;
}

.loading-spinner {
  width: 40px;
  height: 40px;
  border: 4px solid #a5d6a7;
  border-top: 4px solid #388e3c;
  border-radius: 50%;
  animation: spin 1s linear infinite;
  margin: 0 auto 2rem auto;
}

.edit-step-input {
  border: 1.5px solid #81c784;
  border-radius: 6px;
  padding: 0.4em 0.7em;
  font-size: 1em;
  background: #f6fff7;
  color: #256b28;
  flex: 1;
  min-width: 0;
}
.edit-step-input:focus {
  outline: none;
  border-color: #256b28;
  background: #fff;
}
@keyframes spin {
  0% {
    transform: rotate(0deg);
  }
  100% {
    transform: rotate(360deg);
  }
}
.modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.5);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
  padding: 1rem;
}
</style>
