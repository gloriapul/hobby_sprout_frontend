<template>
  <div class="goal-detail">
    <div class="goal-header">
      <button @click="$router.go(-1)" class="back-button">← Back to Goals</button>
      <h1>{{ goal?.description || 'Loading...' }}</h1>
    </div>

    <div v-if="loading" class="loading-state">Loading goal details...</div>

    <div v-else-if="goal" class="goal-content">
      <div class="goal-info-card">
        <div class="goal-meta">
          <div class="meta-item">
            <span class="label">Created:</span>
            <span class="value">{{ goal?.createdAt ? formatDate(goal.createdAt) : '' }}</span>
          </div>
          <div class="meta-item">
            <span class="label">Status:</span>
            <span class="status-badge" :class="{ completed: goal?.completed }">
              {{ goal?.completed ? 'Completed' : 'In Progress' }}
            </span>
          </div>
          <div class="meta-item">
            <span class="label">Progress:</span>
            <span class="value">{{ goalProgress ?? 0 }}%</span>
          </div>
        </div>

        <div class="progress-bar">
          <div class="progress-fill" :style="{ width: goalProgress + '%' }"></div>
        </div>
      </div>

      <div class="steps-section">
        <div class="steps-header">
          <h2>Steps</h2>
          <div class="steps-actions">
            <button @click="generateSteps" :disabled="loading" class="generate-button">
              🤖 Generate Steps
            </button>
            <button @click="showAddStep = true" class="add-step-button">+ Add Step</button>
          </div>
        </div>

        <div v-if="currentGoalSteps.length === 0" class="empty-steps">
          <p>No steps yet. Generate AI-powered steps or add your own!</p>
        </div>

        <div v-else class="steps-list">
          <div
            v-for="step in currentGoalSteps"
            :key="step?.id"
            class="step-item"
            :class="{ completed: step?.isComplete }"
          >
            <button
              @click="toggleStep(step)"
              class="step-checkbox"
              :class="{ checked: step?.isComplete }"
            >
              ✓
            </button>
            <div class="step-content">
              <span class="step-description">{{ step.description }}</span>
            </div>
          </div>
        </div>
      </div>
    </div>

    <div v-else class="error-state">Goal not found</div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { useRoute } from 'vue-router'
import { useMilestoneStore } from '@/stores/milestone'
import { formatDate } from '@/utils'

const route = useRoute()
const milestoneStore = useMilestoneStore()

const goal = computed(() => milestoneStore.currentGoal)
const currentGoalSteps = computed(() => milestoneStore.currentGoalSteps)
const goalProgress = computed(() => milestoneStore.goalProgress)
const loading = computed(() => milestoneStore.loading)

const showAddStep = ref(false)

const generateSteps = async () => {
  if (!goal.value) return
  console.log('🔍 generateSteps - goal.value:', goal.value)
  console.log('🔍 generateSteps - goal.value.id:', goal.value.id)
  await milestoneStore.generateSteps(goal.value.id)
}

const addStep = async (stepData: { description: string }) => {
  if (!goal.value) return
  await milestoneStore.addStep(goal.value.id, stepData.description)
  showAddStep.value = false
}

const toggleStep = async (step: any) => {
  if (!step.completed) {
    await milestoneStore.completeStep(step.id)
  }
}

onMounted(async () => {
  const goalId = route.params.id as string
  if (goalId) {
    await milestoneStore.loadGoal(goalId)
  }
})
</script>

<style scoped>
.goal-detail {
  max-width: 800px;
  margin: 0 auto;
}

.goal-header {
  margin-bottom: 2rem;
}

.back-button {
  background: none;
  border: 1px solid #e9ecef;
  color: #28a745;
  padding: 0.5rem 1rem;
  border-radius: 6px;
  cursor: pointer;
  margin-bottom: 1rem;
  font-size: 0.9rem;
}

.back-button:hover {
  background: #f8f9fa;
}

.goal-header h1 {
  margin: 0;
  color: #333;
  font-size: 1.8rem;
  line-height: 1.3;
}

.loading-state,
.error-state {
  text-align: center;
  padding: 4rem 2rem;
  color: #666;
  font-size: 1.1rem;
}

.goal-info-card {
  background: white;
  border-radius: 12px;
  padding: 2rem;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
  margin-bottom: 2rem;
}

.goal-meta {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 1rem;
  margin-bottom: 1.5rem;
}

.meta-item {
  display: flex;
  flex-direction: column;
  gap: 0.25rem;
}

.label {
  font-size: 0.85rem;
  color: #666;
  font-weight: 500;
}

.value {
  color: #333;
  font-weight: 500;
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
  align-self: flex-start;
}

.status-badge.completed {
  background: #28a745;
}

.progress-bar {
  height: 12px;
  background: #e9ecef;
  border-radius: 6px;
  overflow: hidden;
}

.progress-fill {
  height: 100%;
  background: linear-gradient(90deg, #667eea, #764ba2);
  border-radius: 6px;
  transition: width 0.3s ease;
}

.steps-section {
  background: white;
  border-radius: 12px;
  padding: 2rem;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
}

.steps-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 1.5rem;
}

.steps-header h2 {
  margin: 0;
  color: #333;
}

.steps-actions {
  display: flex;
  gap: 0.5rem;
}

.generate-button {
  background: #667eea;
  color: white;
  border: none;
  padding: 0.5rem 1rem;
  border-radius: 6px;
  cursor: pointer;
  font-size: 0.9rem;
}

.generate-button:hover:not(:disabled) {
  background: #28a745;
}

.add-step-button {
  background: #28a745;
  color: white;
  border: none;
  padding: 0.5rem 1rem;
  border-radius: 6px;
  cursor: pointer;
  font-size: 0.9rem;
}

.add-step-button:hover {
  background: #218838;
}

.empty-steps {
  text-align: center;
  padding: 2rem;
  color: #666;
}

.steps-list {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

.step-item {
  display: flex;
  align-items: center;
  gap: 1rem;
  padding: 1rem;
  border-radius: 8px;
  background: #f8f9fa;
  transition: all 0.2s;
}

.step-item.completed {
  background: #d4edda;
}

.step-checkbox {
  width: 24px;
  height: 24px;
  border: 2px solid #ddd;
  border-radius: 4px;
  background: white;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  color: transparent;
  font-size: 14px;
  flex-shrink: 0;
}

.step-checkbox.checked {
  background: #28a745;
  border-color: #28a745;
  color: white;
}

.step-content {
  flex: 1;
}

.step-description {
  color: #333;
  line-height: 1.4;
}

.step-item.completed .step-description {
  text-decoration: line-through;
  opacity: 0.7;
}

@media (max-width: 768px) {
  .goal-meta {
    grid-template-columns: 1fr;
  }

  .steps-header {
    flex-direction: column;
    gap: 1rem;
  }

  .steps-actions {
    flex-direction: column;
    width: 100%;
  }
}
</style>
