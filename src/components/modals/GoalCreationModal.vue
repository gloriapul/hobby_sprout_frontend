<template>
  <div class="modal-overlay" @click="$emit('close')">
    <div class="modal-content" @click.stop>
      <div class="modal-header">
        <h2>Create New Goal</h2>
        <button @click="$emit('close')" class="close-button">×</button>
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
            <h3>Review Generated Steps</h3>
            <ul class="steps-list">
              <li v-for="(step, idx) in steps" :key="idx">
                {{ step }}
                <button @click="removeStep(idx)" class="delete-step">Delete</button>
              </li>
            </ul>
            <button @click="step = 3" class="next-button">Continue</button>
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
              <button type="submit" class="next-button">Add Step</button>
            </div>
          </form>
          <ul class="steps-list">
            <li v-for="(step, idx) in steps" :key="idx">
              {{ step }}
              <button @click="removeStep(idx)" class="delete-step">Delete</button>
            </li>
          </ul>
          <button @click="step = 3" :disabled="steps.length === 0" class="next-button">
            Continue
          </button>
        </div>
        <div v-else-if="step === 3" class="step-content">
          <h3>Finalize Your Goal</h3>
          <ul class="steps-list">
            <li v-for="(step, idx) in steps" :key="idx">
              {{ step }}
              <button @click="removeStep(idx)" class="delete-step">Delete</button>
            </li>
          </ul>
          <button @click="saveGoal" class="primary-button">Save Goal & Steps</button>
        </div>
      </div>
      <div class="modal-footer">
        <button @click="$emit('close')" class="cancel-button">Cancel</button>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'
const props = defineProps<{ hobby: string }>()

const emit = defineEmits(['close', 'goalCreated'])
const step = ref(1)
const method = ref<'generate' | 'manual' | null>(null)
const goalDescription = ref('')
const steps = ref<string[]>([])
const manualStepInput = ref('')
const manualStepError = ref('')
const generating = ref(false)

function chooseMethod(selected: 'generate' | 'manual') {
  method.value = selected
  step.value = 2
  if (selected === 'generate') {
    generateSteps()
  }
}

function generateSteps() {
  generating.value = true
  setTimeout(() => {
    // Simulate API call
    steps.value = [
      `Research how to achieve: ${goalDescription.value}`,
      'Break goal into smaller tasks',
      'Set deadlines for each step',
      'Track progress and adjust as needed',
    ]
    generating.value = false
  }, 1200)
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
  steps.value.push(manualStepInput.value.trim())
  manualStepInput.value = ''
}

function removeStep(idx: number) {
  steps.value.splice(idx, 1)
}

function saveGoal() {
  emit('goalCreated', {
    description: goalDescription.value,
    steps: steps.value.filter((s) => s.trim()),
    hobby: props.hobby,
  })
  emit('close')
}

// In the parent component (example):
// <GoalCreationModal :hobby="selectedHobby" @goalCreated="handleGoalCreated" />
//
// methods: {
//   async handleGoalCreated(goalData) {
//     await milestoneStore.createGoal(userId, goalData.description, goalData.hobby)
//     // Optionally, add steps to the goal here
//   }
// }
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
  background: linear-gradient(135deg, #e8f5e9 0%, #c8e6c9 100%);
  border-radius: 20px;
  width: 100%;
  max-width: 600px;
  max-height: 90vh;
  overflow-y: auto;
  box-shadow: 0 10px 40px rgba(56, 142, 60, 0.15);
  border: 1px solid #a5d6a7;
}
.modal-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 2rem 2rem 1rem 2rem;
  border-bottom: 1px solid #a5d6a7;
  background: linear-gradient(90deg, #a5d6a7 0%, #81c784 100%);
  border-top-left-radius: 20px;
  border-top-right-radius: 20px;
}
.modal-header h2 {
  margin: 0;
  color: #388e3c;
  font-size: 1.7rem;
  font-weight: 700;
  letter-spacing: 1px;
}
.close-button {
  background: none;
  border: none;
  font-size: 2rem;
  color: #388e3c;
  cursor: pointer;
  width: 40px;
  height: 40px;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 50%;
  transition: background-color 0.2s;
}
.close-button:hover {
  background: #c8e6c9;
  color: #1b5e20;
}
.modal-body {
  padding: 2rem;
}
.modal-body label {
  color: #388e3c;
  font-weight: 600;
  margin-bottom: 0.5rem;
  display: block;
}
.modal-body textarea,
.modal-body input {
  width: 100%;
  border-radius: 8px;
  border: 1px solid #a5d6a7;
  padding: 0.75rem;
  margin-bottom: 0.5rem;
  font-size: 1rem;
  background: #f1f8e9;
  color: #388e3c;
  transition: border-color 0.2s;
}
.modal-body textarea:focus,
.modal-body input:focus {
  outline: none;
  border-color: #388e3c;
}
.step-content h3 {
  margin: 0 0 0.5rem 0;
  color: #333;
  font-size: 1.3rem;
}
.form-help {
  color: #388e3c;
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
  background: #f1f8e9;
  border-radius: 8px;
  padding: 0.5rem 1rem;
  box-shadow: 0 2px 8px rgba(56, 142, 60, 0.05);
}
.delete-step {
  background: linear-gradient(135deg, #a5d6a7 0%, #388e3c 100%);
  color: white;
  border: none;
  border-radius: 6px;
  padding: 0.25rem 0.75rem;
  cursor: pointer;
  font-size: 0.95rem;
  transition: background 0.2s;
}
.delete-step:hover {
  background: linear-gradient(135deg, #388e3c 0%, #a5d6a7 100%);
}
.next-button,
.primary-button {
  background: linear-gradient(135deg, #81c784 0%, #388e3c 100%);
  color: white;
  border: none;
  padding: 0.75rem 1.5rem;
  border-radius: 10px;
  font-size: 1rem;
  cursor: pointer;
  font-weight: 600;
  box-shadow: 0 2px 8px rgba(56, 142, 60, 0.08);
  transition:
    transform 0.2s,
    box-shadow 0.2s;
}
.next-button:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}
.secondary-button {
  background: transparent;
  color: #388e3c;
  border: 2px solid #388e3c;
  padding: 0.75rem 1.5rem;
  border-radius: 10px;
  font-size: 1rem;
  cursor: pointer;
  font-weight: 600;
  transition: all 0.2s;
}
.secondary-button:hover {
  background: #388e3c;
  color: white;
}
.cancel-button {
  background: transparent;
  color: #388e3c;
  border: 2px solid #388e3c;
  padding: 0.75rem 1.5rem;
  border-radius: 10px;
  font-size: 1rem;
  cursor: pointer;
  font-weight: 600;
  transition: all 0.2s;
}
.cancel-button:hover {
  background: #388e3c;
  color: white;
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
@keyframes spin {
  0% {
    transform: rotate(0deg);
  }
  100% {
    transform: rotate(360deg);
  }
}
</style>
