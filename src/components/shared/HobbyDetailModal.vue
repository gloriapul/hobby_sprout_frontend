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
              <div class="goal-row-flex">
                <div class="goal-main">
                  <span class="goal-desc">{{ goal.description }}</span>
                </div>
                <div class="goal-meta">
                  <span v-if="getGoalStartedDate(goal)" class="goal-date">
                    <span class="goal-date-label">Started:</span>
                    {{ formatDate(getGoalStartedDate(goal)!) }}
                  </span>
                  <span v-if="getGoalCompletedDate(goal)" class="goal-date">
                    <span class="goal-date-label">Completed:</span>
                    {{ formatDate(getGoalCompletedDate(goal)!) }}
                  </span>
                  <span class="goal-status-wrap">
                    <span class="goal-date-label">Status:</span>
                    <span v-if="goal.completed" class="goal-status completed">Inactive</span>
                    <span v-else class="goal-status">Active</span>
                  </span>
                </div>
              </div>
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

// Helper: get started date from steps
function getGoalStartedDate(goal: any): string | null {
  if (!goal.steps || !Array.isArray(goal.steps) || goal.steps.length === 0) return null
  // Find earliest step.start (or createdAt fallback)
  const dates = goal.steps.map((s: any) => s.start || s.createdAt).filter(Boolean)
  if (dates.length === 0) return null
  return dates.reduce((earliest: string, curr: string) =>
    new Date(curr) < new Date(earliest) ? curr : earliest,
  )
}
// Helper: get completed date from steps (if all complete)
function getGoalCompletedDate(goal: any): string | null {
  if (!goal.steps || !Array.isArray(goal.steps) || goal.steps.length === 0) return null
  if (!goal.steps.every((s: any) => s.isComplete)) return null
  // Find latest step.completion (or completedAt fallback)
  const dates = goal.steps.map((s: any) => s.completion || s.completedAt).filter(Boolean)
  if (dates.length === 0) return null
  return dates.reduce((latest: string, curr: string) =>
    new Date(curr) > new Date(latest) ? curr : latest,
  )
}

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
.goal-row-flex {
  display: flex;
  flex-direction: column;
  align-items: flex-start;
  gap: 0.1em;
  margin-bottom: 0.5em;
  padding-left: 0.5em;
  word-break: break-word;
  max-width: 100%;
}
.goal-main {
  display: flex;
  align-items: center;
  gap: 0.5em;
  width: 100%;
  flex-wrap: wrap;
}
.goal-meta {
  display: flex;
  flex-wrap: wrap;
  gap: 1em;
  margin-left: 1.5em;
  margin-top: 0.1em;
}
.goal-desc {
  font-weight: 500;
  margin-left: 0.5em;
  margin-right: 0.5em;
  flex: 1 1 auto;
  min-width: 80px;
  word-break: break-word;
}
.goal-date,
.goal-status,
.goal-status.completed {
  color: #888;
}
.goal-date {
  white-space: nowrap;
}
.goal-date-label {
  font-weight: 500;
  color: #666;
  margin-right: 0.2em;
}
.goal-status-wrap {
  display: flex;
  align-items: center;
  gap: 0.2em;
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
