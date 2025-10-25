<template>
  <div class="modal-overlay" @click.self="emit('close')">
    <div class="modal-content">
      <div class="modal-header">
        <h2>{{ hobby }}</h2>
        <button @click="emit('close')" class="close-btn">×</button>
      </div>
      <div class="modal-body">
        <div class="goals-section">
          <h3>Goals for this Hobby</h3>
          <div v-if="props.loading" class="goals-spinner-wrap">
            <span class="spinner"></span>
          </div>
          <ul v-else-if="Array.isArray(goals) && goals.length">
            <li v-for="goal in goals" :key="goal.id">
              <div>
                <span>{{ goal.description }}</span>
                <span v-if="goal.createdAt" class="goal-date"
                  >Started: {{ formatDate(goal.createdAt) }}</span
                >
                <span v-if="goal.completed && goal.completedAt" class="goal-date">
                  | Completed: {{ formatDate(goal.completedAt) }}</span
                >
              </div>
              <span v-if="goal.completed" class="goal-status completed">(Completed)</span>
              <span v-else class="goal-status">(In Progress)</span>
            </li>
          </ul>
          <div v-else-if="Array.isArray(goals) && goals.length === 0">
            No goals found for this hobby.
          </div>
        </div>
        <div class="actions">
          <button v-if="isActive" @click="markInactive" class="inactive-btn">
            Mark as Inactive
          </button>
          <button v-else class="inactive-btn" style="visibility: hidden" aria-hidden="true">
            Mark as Inactive
          </button>
          <button v-if="!isActive" @click="markActive" class="active-btn">Mark as Active</button>
        </div>
        <div v-if="showInactiveError" class="inactive-error">
          Cannot mark as inactive while there are active goals.
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, watch } from 'vue'
import { formatDate } from '@/utils'
const emit = defineEmits(['close', 'markInactive', 'markActive'])
const props = defineProps<{
  hobby: string
  isActive: boolean
  goals: any[] | null
  loading?: boolean
}>()

const showInactiveError = ref(false)

const markInactive = () => {
  if (Array.isArray(props.goals) && props.goals.some((g) => g.isActive)) {
    showInactiveError.value = true
    return
  }
  emit('markInactive', props.hobby)
}
const markActive = () => emit('markActive', props.hobby)

// Reset error when modal closes or state changes
watch(
  () => [props.hobby, props.isActive, props.goals],
  () => {
    showInactiveError.value = false
  },
)
</script>

<style scoped>
.inactive-error {
  color: #c62828;
  margin-top: 0.5rem;
  font-size: 1rem;
  text-align: right;
}
.close-error-btn {
  background: none;
  border: none;
  color: #c62828;
  font-size: 1.2rem;
  margin-left: 0.5rem;
  cursor: pointer;
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
}
.modal-content {
  background: #fff;
  border-radius: 16px;
  width: 400px;
  min-width: 400px;
  max-width: 400px;
  padding: 2rem;
  box-shadow: 0 4px 24px rgba(0, 0, 0, 0.15);
}
.modal-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 1rem;
}
.close-btn {
  background: none;
  border: none;
  font-size: 1.5rem;
  cursor: pointer;
}
.goals-section {
  margin-bottom: 1.5rem;
  min-height: 80px;
  width: 100%;
}
.goals-section ul {
  width: 100%;
  min-width: 0;
  padding-left: 1.2em;
  box-sizing: border-box;
}
.goals-section > div {
  width: 100%;
  text-align: left;
  padding-left: 0;
  box-sizing: border-box;
}
.goal-status {
  margin-left: 0.5rem;
  font-size: 0.95em;
  color: #888;
}
.goal-status.completed {
  color: #388e3c;
}
.actions {
  display: flex;
  gap: 1rem;
  justify-content: flex-end;
  min-height: 42px;
  min-width: 220px;
  position: relative;
}
.inactive-btn {
  background: #fff3e0;
  color: #e65100;
  border: 1px solid #e65100;
  border-radius: 8px;
  padding: 0.5rem 1rem;
  cursor: pointer;
}
.active-btn {
  background: #e8f5e9;
  color: #388e3c;
  border: 1px solid #388e3c;
  border-radius: 8px;
  padding: 0.5rem 1rem;
  cursor: pointer;
}
.goals-spinner-wrap {
  display: flex;
  align-items: center;
  justify-content: center;
  min-height: 60px;
}
.spinner {
  display: inline-block;
  width: 2em;
  height: 2em;
  border: 3px solid #e0e0e0;
  border-top: 3px solid #43a047;
  border-radius: 50%;
  animation: spin 0.8s linear infinite;
  vertical-align: middle;
}
@keyframes spin {
  0% {
    transform: rotate(0deg);
  }
  100% {
    transform: rotate(360deg);
  }
}

.goal-date {
    margin-left: 0.5em;
    color: #888;
    font-size: 0.95em;
}

</style>

<style scoped>
.inactive-error {
  color: #c62828;
  margin-top: 0.5rem;
  font-size: 1rem;
  text-align: right;
}
.close-error-btn {
  background: none;
  border: none;
  color: #c62828;
  font-size: 1.2rem;
  margin-left: 0.5rem;
  cursor: pointer;
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
}
.modal-content {
  background: #fff;
  border-radius: 16px;
  width: 400px;
  min-width: 400px;
  max-width: 400px;
  padding: 2rem;
  box-shadow: 0 4px 24px rgba(0, 0, 0, 0.15);
}
.modal-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 1rem;
}
.close-btn {
  background: none;
  border: none;
  font-size: 1.5rem;
  cursor: pointer;
}
.goals-section {
  margin-bottom: 1.5rem;
  min-height: 80px;
  width: 100%;
}
.goals-section ul {
  width: 100%;
  min-width: 0;
  padding-left: 1.2em;
  box-sizing: border-box;
}
.goals-section > div {
  width: 100%;
  text-align: left;
  padding-left: 0;
  box-sizing: border-box;
}
.goal-status {
  margin-left: 0.5rem;
  font-size: 0.95em;
  color: #888;
}
.goal-status.completed {
  color: #388e3c;
}
.actions {
  display: flex;
  gap: 1rem;
  justify-content: flex-end;
  min-height: 42px;
  min-width: 220px;
  position: relative;
}
.inactive-btn {
  background: #fff3e0;
  color: #e65100;
  border: 1px solid #e65100;
  border-radius: 8px;
  padding: 0.5rem 1rem;
  cursor: pointer;
}
.active-btn {
  background: #e8f5e9;
  color: #388e3c;
  border: 1px solid #388e3c;
  border-radius: 8px;
  padding: 0.5rem 1rem;
  cursor: pointer;
}
.goals-spinner-wrap {
  display: flex;
  align-items: center;
  justify-content: center;
  min-height: 60px;
}
.spinner {
  display: inline-block;
  width: 2em;
  height: 2em;
  border: 3px solid #e0e0e0;
  border-top: 3px solid #43a047;
  border-radius: 50%;
  animation: spin 0.8s linear infinite;
  vertical-align: middle;
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
