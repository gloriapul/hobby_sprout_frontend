<template>
  <div class="goal-card">
    <div class="goal-header">
      <h3>{{ goal.description }}</h3>
      <div class="goal-actions">
        <button @click="$emit('view', goal.id)" class="view-button" title="View details">
          <svg viewBox="0 0 20 20" fill="currentColor">
            <path d="M10 12a2 2 0 100-4 2 2 0 000 4z" />
            <path
              fill-rule="evenodd"
              d="M.458 10C1.732 5.943 5.522 3 10 3s8.268 2.943 9.542 7c-1.274 4.057-5.064 7-9.542 7S1.732 14.057.458 10zM14 10a4 4 0 11-8 0 4 4 0 018 0z"
              clip-rule="evenodd"
            />
          </svg>
        </button>
        <button @click="$emit('delete', goal.id)" class="delete-button" title="Delete goal">
          <svg viewBox="0 0 20 20" fill="currentColor">
            <path
              fill-rule="evenodd"
              d="M9 2a1 1 0 000 2h2a1 1 0 100-2H9zM4 5a2 2 0 012-2h8a2 2 0 012 2v6a2 2 0 01-2 2H6a2 2 0 01-2-2V5zm3 4a1 1 0 112 0v3a1 1 0 11-2 0V9zm4 0a1 1 0 112 0v3a1 1 0 11-2 0V9z"
              clip-rule="evenodd"
            />
          </svg>
        </button>
      </div>
    </div>

    <div class="goal-info">
      <div class="goal-date">Created {{ formatDate(goal.createdAt) }}</div>

      <div class="goal-status">
        <span class="status-badge" :class="{ completed: goal.completed }">
          {{ goal.completed ? 'Completed' : 'In Progress' }}
        </span>
      </div>
    </div>

    <div class="goal-progress">
      <div class="progress-label">Progress</div>
      <div class="progress-bar">
        <div class="progress-fill" :style="{ width: progress + '%' }"></div>
      </div>
      <div class="progress-text">{{ progress }}%</div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { formatDate } from '@/utils'

interface Goal {
  id: string
  description: string
  user: string
  createdAt: string
  completed: boolean
}

interface Props {
  goal: Goal
}

const props = defineProps<Props>()

defineEmits<{
  view: [goalId: string]
  delete: [goalId: string]
}>()

const progress = computed(() => {
  if (props.goal.completed) return 100
})
</script>

<style scoped>
.goal-card {
  background: white;
  border-radius: 12px;
  padding: 1.5rem;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
  transition: all 0.2s;
}

.goal-card:hover {
  box-shadow: 0 4px 16px rgba(0, 0, 0, 0.1);
  transform: translateY(-2px);
}

.goal-header {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  margin-bottom: 1rem;
  gap: 1rem;
}

.goal-header h3 {
  margin: 0;
  color: #333;
  font-size: 1.1rem;
  line-height: 1.4;
  flex: 1;
}

.goal-actions {
  display: flex;
  gap: 0.5rem;
  flex-shrink: 0;
}

.view-button,
.delete-button {
  background: none;
  border: 1px solid #e9ecef;
  width: 32px;
  height: 32px;
  border-radius: 6px;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  transition: all 0.2s;
}

.view-button {
  color: #388e3c;
  border-color: #388e3c;
}

.view-button:hover {
  background: #388e3c;
  color: white;
}

.delete-button {
  color: #dc3545;
  border-color: #dc3545;
}

.delete-button:hover {
  background: #dc3545;
  color: white;
}

.view-button svg,
.delete-button svg {
  width: 16px;
  height: 16px;
}

.goal-info {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 1rem;
  gap: 1rem;
}

.goal-date {
  font-size: 0.85rem;
  color: #666;
}

.status-badge {
  background: #ffc107;
  color: white;
  padding: 0.25rem 0.75rem;
  border-radius: 12px;
  font-size: 0.75rem;
  font-weight: 500;
  text-transform: uppercase;
  letter-spacing: 0.5px;
}

.status-badge.completed {
  background: #28a745;
}

.goal-progress {
  display: flex;
  align-items: center;
  gap: 0.75rem;
}

.progress-label {
  font-size: 0.85rem;
  color: #666;
  font-weight: 500;
  min-width: 60px;
}

.progress-bar {
  flex: 1;
  height: 8px;
  background: #e9ecef;
  border-radius: 4px;
  overflow: hidden;
}

.progress-fill {
  height: 100%;
  background: linear-gradient(90deg, #388e3c, #28a745);
  border-radius: 4px;
  transition: width 0.3s ease;
}

.progress-text {
  font-size: 0.85rem;
  color: #666;
  font-weight: 500;
  min-width: 40px;
  text-align: right;
}
</style>
