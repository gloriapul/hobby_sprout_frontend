<template>
  <div class="modal-overlay" @click="step === 1 || manualStepError ? handleClose() : null">
    <div class="modal-content" @click.stop>
      <div class="modal-header">
        <h2>Create New Goal</h2>
        <button v-if="step === 1 || manualStepError" @click="handleClose" class="close-button">
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
          <div class="choose-method">
            <button
              @click="chooseMethod('generate')"
              :disabled="!goalDescription.trim()"
              class="next-button"
            >
              Generate Steps
            </button>
            <button
              @click="chooseMethod('manual')"
              :disabled="!goalDescription.trim()"
              class="next-button"
            >
              Enter Steps Manually
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
            <draggable
              v-model="steps"
              class="steps-list"
              item-key="idx"
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
                    v-model="steps[idx]"
                    class="edit-step-input"
                    :placeholder="`Step ${idx + 1}`"
                    @input="manualStepError = ''"
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
              <span v-if="manualStepError" class="error-message">{{ manualStepError }}</span>
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
            <button @click="regenerateSteps" class="secondary-button">Regenerate Steps</button>
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
              ></textarea>
              <span v-if="manualStepError" class="error-message">{{ manualStepError }}</span>
            </div>
            <div class="form-actions">
              <button type="submit" class="next-button">Add Manual Step</button>
            </div>
          </form>
          <draggable
            v-model="steps"
            class="steps-list"
            item-key="idx"
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
                {{ step }}
                <button @click="removeStep(idx)" class="delete-step">Delete</button>
              </li>
            </template>
          </draggable>
          <button @click="saveGoal" :disabled="steps.length === 0" class="primary-button">
            Save Goal & Steps
          </button>
        </div>
        <div v-else-if="step === 3" class="step-content">
          <h3>Finalize Your Goal</h3>
          <draggable
            v-model="steps"
            class="steps-list"
            item-key="idx"
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
                {{ step }}
                <button @click="removeStep(idx)" class="delete-step">Delete</button>
              </li>
            </template>
          </draggable>
          <button @click="saveGoal" class="primary-button">Save Goal & Steps</button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import draggable from 'vuedraggable'
function resetModalState() {
  step.value = 1
  method.value = null
  goalDescription.value = ''
  steps.value = []
  manualStepInput.value = ''
  manualStepError.value = ''
  generating.value = false
}

function handleClose() {
  resetModalState()
  emit('close')
}
const props = defineProps<{ hobby: string }>()

const emit = defineEmits(['close', 'goalCreated'])
const step = ref(1)
const method = ref<'generate' | 'manual' | null>(null)
const goalDescription = ref('')
const steps = ref<string[]>([])
const manualStepInput = ref('')
const manualStepError = ref('')
const generating = ref(false)
import { useAuthStore } from '@/stores/auth'
const authStore = useAuthStore()

async function chooseMethod(selected: 'generate' | 'manual') {
  method.value = selected
  step.value = 2
  if (selected === 'generate') {
    generating.value = true
    manualStepError.value = ''
    steps.value = []
    try {
      const { ApiService } = await import('@/services/api')
      const userId = authStore.user?.id
      if (!userId) throw new Error('User not found')
      // Check for existing active goal for this user and hobby
      const existingGoals = await ApiService.callConceptAction<any>(
        'MilestoneTracker',
        '_getGoal',
        {
          user: userId,
          hobby: props.hobby,
        },
      )
      if (Array.isArray(existingGoals) && existingGoals.length > 0) {
        manualStepError.value =
          'You already have an active goal for this hobby. Please close it before creating a new one.'
        generating.value = false
        return
      }
      // 1. Create the goal first
      const goalResult = await ApiService.callConceptAction<any>('MilestoneTracker', 'createGoal', {
        user: userId,
        description: goalDescription.value,
        hobby: props.hobby,
      })
      if (goalResult && typeof goalResult.error === 'string') {
        manualStepError.value = goalResult.error
        throw new Error(goalResult.error)
      }
      const goalId = goalResult.goal
      if (!goalId) throw new Error('Failed to create goal.')
      // 2. Generate steps for the new goal
      const genResult = await ApiService.callConceptAction<any>(
        'MilestoneTracker',
        'generateSteps',
        {
          goal: goalId,
        },
      )
      if (genResult && Array.isArray(genResult.steps)) {
        // 3. Fetch the generated steps' details
        const stepsResult = await ApiService.callConceptAction<any>(
          'MilestoneTracker',
          '_getSteps',
          {
            goal: goalId,
          },
        )
        if (stepsResult && Array.isArray(stepsResult)) {
          steps.value = stepsResult.map((s: any) => s.description)
        } else {
          manualStepError.value = 'Failed to fetch generated steps.'
        }
      } else if (genResult && typeof genResult.error === 'string') {
        manualStepError.value = genResult.error
      } else {
        manualStepError.value = 'Failed to generate steps. Please try again.'
      }
    } catch (err) {
      manualStepError.value = 'Failed to generate steps. Please try again.'
      console.error('[GoalCreationModal] Error generating steps:', err)
    } finally {
      generating.value = false
    }
  }
}

async function generateSteps() {
  generating.value = true
  manualStepError.value = ''
  steps.value = []
  try {
    const { ApiService } = await import('@/services/api')
    const userId = authStore.user?.id
    if (!userId) throw new Error('User not found')
    // Check for existing active goal for this user and hobby
    const existingGoals = await ApiService.callConceptAction<any>('MilestoneTracker', '_getGoal', {
      user: userId,
      hobby: props.hobby,
    })
    if (Array.isArray(existingGoals) && existingGoals.length > 0) {
      manualStepError.value =
        'You already have an active goal for this hobby. Please close it before creating a new one.'
      generating.value = false
      return
    }
    // 1. Create the goal first
    const goalResult = await ApiService.callConceptAction<any>('MilestoneTracker', 'createGoal', {
      user: userId,
      description: goalDescription.value,
      hobby: props.hobby,
    })
    if (goalResult && typeof goalResult.error === 'string') {
      manualStepError.value = goalResult.error
      throw new Error(goalResult.error)
    }
    const goalId = goalResult.goal
    if (!goalId) throw new Error('Failed to create goal.')
    // 2. Generate steps for the new goal
    const genResult = await ApiService.callConceptAction<any>('MilestoneTracker', 'generateSteps', {
      goal: goalId,
    })
    if (genResult && Array.isArray(genResult.steps)) {
      // 3. Fetch the generated steps' details
      const stepsResult = await ApiService.callConceptAction<any>('MilestoneTracker', '_getSteps', {
        goal: goalId,
      })
      if (stepsResult && Array.isArray(stepsResult)) {
        steps.value = stepsResult.map((s: any) => s.description)
      } else {
        manualStepError.value = 'Failed to fetch generated steps.'
      }
    } else if (genResult && typeof genResult.error === 'string') {
      manualStepError.value = genResult.error
    } else {
      manualStepError.value = 'Failed to generate steps. Please try again.'
    }
  } catch (err) {
    manualStepError.value = 'Failed to generate steps. Please try again.'
    console.error('[GoalCreationModal] Error generating steps:', err)
  } finally {
    generating.value = false
  }
}

function regenerateSteps() {
  generateSteps()
}

function validateManualStep() {
  manualStepError.value = ''
  if (!manualStepInput.value.trim()) {
    manualStepError.value = 'Step description is required'
    return false
  }
  if (manualStepInput.value.trim().length < 10) {
    manualStepError.value = 'Step description should be at least 10 characters'
    return false
  }
  return true
}

function handleAddStep() {
  if (!validateManualStep()) return
  const stepText = manualStepInput.value.trim()
  steps.value.push(stepText)
  // Debug output
  console.log('[GoalCreationModal] Added step:', stepText, 'Current steps:', steps.value)
  manualStepInput.value = ''
  manualStepError.value = ''
}

function removeStep(idx: number) {
  steps.value.splice(idx, 1)
}

async function saveGoal() {
  try {
    if (!props.hobby) {
      manualStepError.value = 'No hobby selected. Please select a hobby before creating a goal.'
      return
    }
    if (!goalDescription.value || !goalDescription.value.trim()) {
      manualStepError.value = 'Goal description is required.'
      return
    }
    const userId = authStore.user?.id
    if (!userId) throw new Error('User not found')
    const { ApiService } = await import('@/services/api')
    // 1. Find the active goal for this user/hobby (should exist already)
    let goalId: string | undefined
    const existingGoals = await ApiService.callConceptAction<any>('MilestoneTracker', '_getGoal', {
      user: userId,
      hobby: props.hobby,
    })
    if (Array.isArray(existingGoals) && existingGoals.length > 0) {
      goalId = existingGoals[0].id
    } else {
      // fallback: try to create if not found (should not happen in normal flow)
      const goalResult = await ApiService.callConceptAction<any>('MilestoneTracker', 'createGoal', {
        user: userId,
        description: goalDescription.value,
        hobby: props.hobby,
      })
      if (goalResult && typeof goalResult.error === 'string') {
        manualStepError.value = goalResult.error
        throw new Error(goalResult.error)
      }
      goalId = goalResult.goal
    }
    if (!goalId) throw new Error('Failed to find or create goal.')
    // 2. Remove all existing steps for this goal
    const existingSteps = await ApiService.callConceptAction<any>('MilestoneTracker', '_getSteps', {
      goal: goalId,
    })
    if (Array.isArray(existingSteps)) {
      for (const step of existingSteps) {
        await ApiService.callConceptAction<any>('MilestoneTracker', 'removeStep', {
          step: step.id,
        })
      }
    }
    // 3. Add all steps in the current order/content
    for (const stepDesc of steps.value) {
      await ApiService.callConceptAction<any>('MilestoneTracker', 'addStep', {
        goal: goalId,
        description: stepDesc,
      })
    }
    emit('goalCreated', {
      description: goalDescription.value,
      steps: steps.value.filter((s) => s.trim()),
      hobby: props.hobby,
    })
    resetModalState()
    emit('close')
  } catch (err) {
    // Show backend error to user
    let errorMsg = 'Failed to save goal. Please try again.'
    if (err && typeof err === 'object' && 'message' in err) {
      errorMsg = (err as any).message
    } else if (typeof err === 'string') {
      errorMsg = err
    }
    manualStepError.value = errorMsg
    console.error('[GoalCreationModal] Error saving goal:', err)
  }
}
</script>

<style scoped>
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
.cancel-button {
  background: transparent;
  color: #256b28;
  border: 2px solid #256b28;
  padding: 0.75rem 1.5rem;
  border-radius: 8px;
  font-size: 1rem;
  cursor: pointer;
  font-weight: 500;
  transition:
    background 0.2s,
    color 0.2s;
}
.cancel-button:hover {
  background: #256b28;
  color: #fff;
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
</style>
