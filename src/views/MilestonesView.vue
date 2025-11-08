<template>
  <div class="my-journey-view milestones-container" style="position: relative">
    <div v-if="showCreateGoal" class="milestones-overlay"></div>
    <div class="journey-header">
      <h1>My Hobby Journey</h1>
      <p class="page-description">Track your progress and achieve your hobby goals step by step</p>
    </div>

    <div v-if="!currentGoal && !loading" class="no-goal-state">
      <div class="no-goal-content">
        <div class="no-goal-icon">🌱</div>
        <h2>Ready to start your hobby journey?</h2>
        <p>Create your first goal and we'll help you break it down into achievable steps.</p>

        <div class="suggested-hobbies" v-if="userHobbies.length > 0">
          <h3>Your Hobbies</h3>
          <div class="hobby-buttons">
            <button
              v-for="hobby in userHobbies"
              :key="hobby"
              @click="createGoalForHobby(hobby)"
              class="hobby-button"
            >
              {{ hobby }}
            </button>
          </div>
        </div>

        <div class="get-started-tips">
          <p>
            Need inspiration? <router-link to="/dashboard/quiz">Take our hobby quiz</router-link> to
            discover new interests!
          </p>
        </div>
      </div>
    </div>

    <!-- Active Goal State: only show if currentGoal is active -->
    <div v-else-if="currentGoal && currentGoal.isActive" class="active-goal-section">
      <div class="goal-header">
        <div class="goal-info">
          <h2>{{ currentGoal.description }}</h2>
          <div class="goal-meta">
            <span class="goal-status">Active Goal</span>
            <span class="step-count">{{ totalSteps }} steps</span>
          </div>
          <div
            v-if="currentGoal.createdAt"
            class="goal-start-date"
            style="margin-top: 0.5rem; color: #666; font-size: 0.95rem"
          >
            Started at: {{ formatDateTime(currentGoal.createdAt) }}
          </div>
        </div>
      </div>

      <!-- Progress Overview -->
      <div class="progress-overview">
        <div class="progress-stats">
          <div class="stat-item">
            <div class="stat-number">{{ completedSteps }}</div>
            <div class="stat-label">Completed</div>
          </div>
          <div class="stat-item">
            <div class="stat-number">{{ goalProgress }}%</div>
            <div class="stat-label">Progress</div>
          </div>
          <div class="stat-item">
            <div class="stat-number">{{ remainingSteps }}</div>
            <div class="stat-label">Remaining</div>
          </div>
        </div>

        <div class="progress-bar-container">
          <div class="progress-bar">
            <div class="progress-fill" :style="{ width: goalProgress + '%' }"></div>
          </div>
        </div>
      </div>

      <!-- Steps List -->
      <div class="steps-section">
        <div class="steps-header">
          <h3>Your Steps</h3>

          <div v-if="generatingSteps || stepsLoading" class="generating-steps">
            <div class="loading-spinner"></div>
            <p>{{ generatingSteps ? 'Creating personalized steps...' : 'Loading steps...' }}</p>
          </div>

          <div v-else-if="currentGoalSteps.length === 0" class="empty-state">
            <p>
              No steps have been created for this goal, an error may have occurred. Abandon goal and
              try again.
            </p>
          </div>

          <div v-else class="steps-list">
            <div
              v-for="(step, index) in currentGoalSteps"
              :key="step.id"
              class="step-item"
              :class="{
                completed: step.isComplete,
                'next-step': !step.isComplete && isNextStep(index),
              }"
            >
              <div class="step-number">{{ index + 1 }}</div>
              <div class="step-content">
                <h4>{{ step.description }}</h4>
                <div class="step-meta">
                  <span v-if="step.completion" class="completion-date">
                    Completed: {{ formatDateTime(step.completion) }}
                  </span>
                </div>
              </div>
              <div class="step-actions">
                <button
                  v-if="!step.isComplete && step.id"
                  @click="completeStep(step.id)"
                  class="complete-button"
                >
                  ✓ Complete
                </button>
                <span v-else class="completed-icon">✅</span>
              </div>
            </div>
          </div>
        </div>
      </div>
      <!-- Achievement Section -->
      <div v-if="goalProgress === 100" class="achievement-section">
        <div class="achievement-card">
          <div class="achievement-icon">🏆</div>
          <h3>Congratulations!</h3>
          <p>
            You've completed your goal: <strong>{{ currentGoal.description }}</strong>
          </p>
          <button @click="resetForNewGoal" class="next-goal-button">Set Your Next Goal</button>
        </div>
      </div>
    </div>

    <div
      v-if="currentGoal && currentGoal.isActive && goalProgress !== 100"
      class="close-goal-actions"
      style="margin-bottom: 2rem"
    >
      <button @click="showAbandonGoalModal = true" class="close-goal">
        <span>Abandon Goal</span>
      </button>
      <ConfirmationModal
        v-if="showAbandonGoalModal"
        :show="showAbandonGoalModal"
        title="Abandon Goal"
        message="Are you sure you want to abandon this goal? This will mark it as closed and cannot be undone."
        confirmText="Abandon Goal"
        cancelText="Cancel"
        @confirm="handleConfirmAbandonGoal"
        @cancel="showAbandonGoalModal = false"
      />
    </div>

    <!-- Loading State -->
    <div v-if="loading" class="loading-state">
      <div class="loading-spinner"></div>
      <p>Loading your journey...</p>
    </div>

    <!-- Create Goal Modal -->
    <GoalCreationModal
      v-if="showCreateGoal"
      @close="showCreateGoal = false"
      @goalCreated="handleGoalCreated"
      :hobby="selectedHobbyForGoal || ''"
    />
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { formatDateTime } from '@/utils'
import { useAuthStore } from '@/stores/auth'
import { useProfileStore } from '@/stores/profile'
import { useMilestoneStore } from '@/stores/milestone'
import GoalCreationModal from '@/components/modals/GoalCreationModal.vue'
import ConfirmationModal from '@/components/shared/ConfirmationModal.vue'

const authStore = useAuthStore()
const profileStore = useProfileStore()
const milestoneStore = useMilestoneStore()

const showCreateGoal = ref(false)
const selectedHobbyForGoal = ref<string | undefined>(undefined)
const generatingSteps = ref(false)
const stepsLoading = ref(false)
const showAbandonGoalModal = ref(false)

// Computed properties
const currentGoal = computed(() => milestoneStore.currentGoal)
const currentGoalSteps = computed(() => milestoneStore.currentGoalSteps)
const loading = computed(() => milestoneStore.loading)
const userHobbies = computed(() => profileStore.activeHobbies || [])

const totalSteps = computed(() => currentGoalSteps.value.length)
const completedSteps = computed(
  () => currentGoalSteps.value.filter((step) => step.isComplete).length,
)
const remainingSteps = computed(() => totalSteps.value - completedSteps.value)
const goalProgress = computed(() => milestoneStore.goalProgress)

const handleConfirmAbandonGoal = async () => {
  await closeActiveGoal()
  showAbandonGoalModal.value = false
}

const closeActiveGoal = async () => {
  if (currentGoal.value) {
    await milestoneStore.closeGoal(currentGoal.value.id)
    milestoneStore.clearCurrentGoal()
    // Reload profile/hobbies so the user can immediately create a new goal for a hobby
    await profileStore.loadProfile()
  }
}

const resetForNewGoal = async () => {
  if (milestoneStore.currentGoal) {
    await milestoneStore.closeGoal(milestoneStore.currentGoal.id)
  }
  milestoneStore.clearCurrentGoal()
  // Reload profile/hobbies so the user can immediately create a new goal for a hobby
  await profileStore.loadProfile()
}

const createGoalForHobby = async (hobby: string) => {
  if (loading.value) return
  if (milestoneStore.currentGoal && milestoneStore.currentGoal.isActive) {
    alert('You already have an active goal. Please complete or close it first.')
    return
  }
  selectedHobbyForGoal.value = hobby
  showCreateGoal.value = true
}

const completeStep = async (stepId: string) => {
  if (!stepId) {
    return
  }
  try {
    await milestoneStore.completeStep(stepId)
  } catch (error) {
    alert('Failed to complete step. Please try again.')
  }
}

const isNextStep = (index: number) => {
  const steps = currentGoalSteps.value
  for (let i = 0; i < steps.length; i++) {
    const step = steps[i]
    if (step && step.isComplete === false) {
      return i === index
    }
  }
  return false
}

const handleGoalCreated = async (goalData: {
  description: string
  steps: string[]
  hobby: string
}) => {
  showCreateGoal.value = false
  selectedHobbyForGoal.value = undefined
  if (authStore.user) {
    stepsLoading.value = true
    try {
      await milestoneStore.loadUserGoals()
      if (milestoneStore.currentGoal && milestoneStore.currentGoal.id) {
        await milestoneStore.loadGoalSteps(milestoneStore.currentGoal.id)
      }
    } finally {
      stepsLoading.value = false
    }
  }
}

onMounted(async () => {
  if (authStore.user) {
    // Always load user profile to get hobbies
    await profileStore.loadProfile()
    // Only fetch goals if store is empty (first load or after logout)
    if (!milestoneStore.goals.length) {
      await milestoneStore.loadUserGoals()
    }
    // Only fetch steps if currentGoal exists and steps are empty
    if (
      milestoneStore.currentGoal &&
      milestoneStore.currentGoal.id &&
      !milestoneStore.steps.length
    ) {
      await milestoneStore.loadGoalSteps(milestoneStore.currentGoal.id)
    }
  }
})
</script>

<style scoped>
.milestones-container {
  position: relative;
}
.milestones-overlay {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background: #fff;
  opacity: 1;
  z-index: 10;
  pointer-events: none;
}
.my-journey-view {
  width: 100%;
  padding: 0;
}

.journey-header {
  text-align: center;
  margin-bottom: 3rem;
}

.journey-header h1 {
  margin: 0 0 0.5rem 0;
  color: #333;
  font-size: 2.5rem;
  font-weight: 500;
  color: #256b28;
}

.page-description {
  color: #666;
  font-size: 1.1rem;
  margin: 0;
}

.no-goal-state {
  display: flex;
  justify-content: center;
  align-items: center;
  min-height: 60vh;
}

.no-goal-content {
  text-align: center;
  max-width: 500px;
  background: #e8f5e9;
  border-radius: 16px;
  padding: 3rem 2rem;
}

.no-goal-icon {
  font-size: 4rem;
  margin-bottom: 1.5rem;
}

.no-goal-content h2 {
  color: #333;
  margin: 0 0 1rem 0;
  font-size: 1.8rem;
}

.no-goal-content p {
  color: #666;
  line-height: 1.6;
  margin-bottom: 2rem;
}

.suggested-hobbies {
  margin: 2rem 0;
}

.suggested-hobbies h3 {
  color: #333;
  margin: 0 0 1rem 0;
  font-size: 1.2rem;
}

.hobby-buttons {
  display: flex;
  flex-wrap: wrap;
  gap: 0.5rem;
  justify-content: center;
  margin-bottom: 1rem;
}

.hobby-button {
  background: linear-gradient(135deg, #81c784 0%, #388e3c 100%);
  border: 2px solid #388e3c;
  color: #ffffff;
  padding: 0.5rem 1rem;
  border-radius: 20px;
  cursor: pointer;
  transition: all 0.2s;
  font-weight: 500;
}

.hobby-button:hover {
  background: #388e3c;
}

.get-started-tips {
  margin-top: 2rem;
  padding-top: 2rem;
  border-top: 1px solid #e9ecef;
}

.get-started-tips p {
  color: #666;
  margin: 0;
  font-size: 0.9rem;
}

.get-started-tips a {
  color: #388e3c;
  text-decoration: none;
  font-weight: 600;
  border-radius: 999px;
  transition:
    background 0.2s,
    color 0.2s;
}

.get-started-tips a:hover {
  background: #e8f5e9;
  color: #256b28;
  text-decoration: none;
}

.active-goal-section {
  max-width: 800px;
  margin: 0 auto;
}

.goal-header {
  background: #e8f5e9;
  border-radius: 16px;
  padding: 2rem;
  margin-bottom: 2rem;
  display: flex;
  justify-content: space-between;
  align-items: center;
  flex-wrap: wrap;
  gap: 1rem;
}

.goal-info h2 {
  margin: 0 0 0.5rem 0;
  color: #333;
  font-size: 1.5rem;
}

.goal-meta {
  display: flex;
  gap: 1rem;
  align-items: center;
}

.goal-status {
  background: #28a745;
  color: white;
  padding: 0.25rem 0.75rem;
  border-radius: 12px;
  font-size: 0.8rem;
  font-weight: 500;
}

.step-count {
  color: #666;
  font-size: 0.9rem;
}

.progress-overview {
  background: #e8f5e9;
  border-radius: 16px;
  padding: 2rem;
  margin-bottom: 2rem;
}

.progress-stats {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(120px, 1fr));
  gap: 1rem;
  margin-bottom: 2rem;
}

.stat-item {
  text-align: center;
}

.stat-number {
  font-size: 2rem;
  font-weight: bold;
  color: #388e3c;
  margin-bottom: 0.25rem;
}

.stat-label {
  color: #666;
  font-size: 0.9rem;
  font-weight: 500;
}

.progress-bar-container {
  margin-top: 1rem;
}

.progress-bar {
  height: 12px;
  background: #e9ecef;
  border-radius: 6px;
  overflow: hidden;
}

.progress-fill {
  height: 100%;
  background: linear-gradient(90deg, #81c784, #388e3c);
  border-radius: 6px;
  transition: width 0.3s ease;
}

.steps-section {
  border-radius: 16px;
  padding: 2rem;
  margin-bottom: 2rem;
  background: #e8f5e9;
}

.steps-header h3 {
  margin: 0;
  color: #333;
  font-size: 1.3rem;
  margin-bottom: 2rem;
}

.loading-spinner {
  width: 40px;
  height: 40px;
  border: 3px solid #e9ecef;
  border-top: 3px solid #388e3c;
  border-radius: 50%;
  animation: spin 1s linear infinite;
  margin: 0 auto 1rem auto;
}

@keyframes spin {
  0% {
    transform: rotate(0deg);
  }
  100% {
    transform: rotate(360deg);
  }
}

.steps-list {
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.step-item {
  display: flex;
  align-items: center;
  gap: 1rem;
  padding: 1.5rem;
  border: 2px solid #ffffff;
  border-radius: 12px;
  transition: all 0.2s;
}

.step-item.completed {
  border-color: #28a745;
  background: linear-gradient(135deg, #ffffff, #f8fff8);
}

.step-item.next-step {
  border-color: #388e3c;
  background: linear-gradient(135deg, #ffffff, #f8f9ff);
}

.step-number {
  width: 40px;
  height: 40px;
  background: #388e3c;
  color: white;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-weight: 600;
  flex-shrink: 0;
}

.step-item.completed .step-number {
  background: #28a745;
}

.step-content {
  flex: 1;
}

.step-content h4 {
  margin: 0 0 0.5rem 0;
  color: #333;
  font-size: 1.1rem;
  background: linear-gradient(135deg, #81c784, #388e3c);
  -webkit-background-clip: text;
  background-clip: text;
  gap: 1rem;
  font-size: 0.9rem;
  color: #666;
}

.step-actions {
  flex-shrink: 0;
}

.complete-button {
  background: #28a745;
  color: white;
  border: none;
  padding: 0.5rem 1rem;
  border-radius: 6px;
  cursor: pointer;
  transition: background-color 0.2s;
}

.complete-button:hover {
  background: #218838;
}

.completed-icon {
  font-size: 1.5rem;
}

.achievement-section {
  margin-top: 2rem;
}

.achievement-card {
  background: linear-gradient(135deg, #fff8e1, #ffffff);
  border: 2px solid #ffc107;
  border-radius: 16px;
  padding: 3rem 2rem;
  text-align: center;
}

.achievement-icon {
  font-size: 4rem;
  margin-bottom: 1rem;
}

.achievement-card h3 {
  color: #333;
  margin: 0 0 1rem 0;
  font-size: 1.8rem;
}

.achievement-card p {
  color: #666;
  margin-bottom: 2rem;
  line-height: 1.6;
}

.next-goal-button {
  background: linear-gradient(135deg, #667eea, #764ba2);
  color: white;
  border: none;
  padding: 1rem 2rem;
  border-radius: 50px;
  font-size: 1.1rem;
  font-weight: 600;
  cursor: pointer;
  transition: transform 0.2s;
}

.next-goal-button:hover {
  background: #667eea;
}

.loading-state {
  text-align: center;
  padding: 4rem 2rem;
}

.loading-state .loading-spinner {
  margin-bottom: 1rem;
}

.loading-state p {
  color: #666;
  font-size: 1.1rem;
}

.close-goal {
  background: #de4d4d;
  color: #fff;
  border: none;
  border-radius: 30px;
  padding: 0.5rem 1.5rem;
  font-size: 1rem;
  font-weight: 600;
  display: inline-flex;
  align-items: center;
  gap: 0.75rem;
  cursor: pointer;
  transition:
    background 0.2s,
    transform 0.2s;
}
.close-goal:hover {
  background: #9a3333;
}
</style>
