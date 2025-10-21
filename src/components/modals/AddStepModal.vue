<template>
  <div class="modal-overlay" @click="$emit('close')">
    <div class="modal-content" @click.stop>
      <div class="modal-header">
        <h2>Add Manual Step</h2>
        <button @click="$emit('close')" class="close-button">×</button>
      </div>
      <div class="modal-body">
        <form @submit.prevent="addStep">
          <label for="stepDescription">Step Description</label>
          <textarea
            id="stepDescription"
            v-model="stepDescription"
            placeholder="Describe what needs to be done for this step..."
            rows="3"
            required
          ></textarea>
          <span v-if="error" class="error-message">{{ error }}</span>
          <button type="submit" class="primary-button">Add Step</button>
        </form>
        <ul class="steps-list">
          <li v-for="(step, idx) in steps" :key="idx">
            {{ step }}
            <button @click="steps.splice(idx, 1)" class="delete-step">Delete</button>
          </li>
        </ul>
        <button @click="saveSteps" :disabled="steps.length === 0" class="primary-button">
          Save Steps
        </button>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'
const emit = defineEmits(['close', 'stepAdded'])
const stepDescription = ref('')
const error = ref('')
const steps = ref<string[]>([])

function addStep() {
  error.value = ''
  if (!stepDescription.value.trim()) {
    error.value = 'Step description is required'
    return
  }
  if (stepDescription.value.trim().length < 10) {
    error.value = 'Step description should be at least 10 characters'
    return
  }
  steps.value.push(stepDescription.value.trim())
  stepDescription.value = ''
}

function saveSteps() {
  if (steps.value.length > 0) {
    emit('stepAdded', steps.value)
  }
  emit('close')
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
}
.modal-content {
  background: #fff;
  border-radius: 12px;
  width: 100%;
  max-width: 400px;
  box-shadow: 0 4px 24px rgba(0, 0, 0, 0.12);
  padding: 2rem;
}
.modal-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 1rem;
}
.close-button {
  background: none;
  border: none;
  font-size: 1.5rem;
  cursor: pointer;
}
.error-message {
  color: #c62828;
  font-size: 0.9rem;
  margin-top: 0.5rem;
  display: block;
}
.primary-button {
  background: linear-gradient(90deg, #81c784, #388e3c);
  color: #fff;
  border: none;
  border-radius: 8px;
  padding: 0.5rem 1.5rem;
  font-size: 1rem;
  cursor: pointer;
  margin-top: 1rem;
}
.primary-button:hover {
  background: linear-gradient(90deg, #388e3c, #81c784);
}
</style>
