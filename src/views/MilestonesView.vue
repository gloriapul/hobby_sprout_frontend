<template>
  <div class="my-journey-view">
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
          <button
            v-if="currentGoalSteps.length === 0"
            @click="generateStepsForCurrentGoal"
            :disabled="generatingSteps"
            class="generate-steps-button"
          >
            {{ generatingSteps ? 'Generating...' : '✨ Generate Steps' }}
          </button>
        </div>

        <div v-if="generatingSteps" class="generating-steps">
          <div class="loading-spinner"></div>
          <p>Creating personalized steps for your goal...</p>
        </div>

        <div v-else-if="currentGoalSteps.length === 0" class="no-steps">
          <p>No steps yet. Generate AI-powered steps or add your own!</p>
          <button @click="showAddStep = true" class="add-step-button">+ Add Manual Step</button>
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
                <span class="step-date">Started: {{ formatDate(step.start) }}</span>
                <span v-if="step.completion" class="completion-date">
                  Completed: {{ formatDate(step.completion) }}
                </span>
              </div>
            </div>
            <div class="step-actions">
              <button
                v-if="!step.isComplete"
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
      v-if="goalProgress < 100 && currentGoalSteps.length > 0"
      class="close-goal-actions"
      style="margin-bottom: 2rem"
    >
      <button @click="closeActiveGoal" class="close-goal">
        <span>Abandon Goal</span>
      </button>
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
const closeActiveGoal = async () => {
  if (currentGoal.value) {
    await milestoneStore.deleteGoal(currentGoal.value.id)
    milestoneStore.clearCurrentGoal()
    milestoneStore.currentGoal = null
    showCreateGoal.value = false
    selectedHobbyForGoal.value = undefined
    if (authStore.user) {
      await milestoneStore.loadUserGoals(authStore.user.id)
      // After reload, also reload steps for new currentGoal if any
      const goal = milestoneStore.currentGoal as { id?: string } | null
      if (goal && goal.id) {
        await milestoneStore.loadGoalSteps(goal.id)
      }
    }
    await nextTick()
  }
}
// Reset page and allow user to pick a new hobby for next goal
const resetForNewGoal = async () => {
  // Mark the current goal as inactive and completed, and update backend
  if (milestoneStore.currentGoal) {
    milestoneStore.currentGoal.isActive = false
    milestoneStore.currentGoal.completed = true
    await milestoneStore.deleteGoal(milestoneStore.currentGoal.id)
  }
  milestoneStore.clearCurrentGoal()
  milestoneStore.currentGoal = null
  showCreateGoal.value = false
  selectedHobbyForGoal.value = undefined
  if (authStore.user) {
    await milestoneStore.loadUserGoals(authStore.user.id)
    const goal = milestoneStore.currentGoal as { id?: string } | null
    if (goal && goal.id) {
      await milestoneStore.loadGoalSteps(goal.id)
    }
  }
  await nextTick()
}
import { ref, computed, onMounted, nextTick } from 'vue'
import { useAuthStore } from '@/stores/auth'
import { useProfileStore } from '@/stores/profile'
import { useMilestoneStore } from '@/stores/milestone'
import GoalCreationModal from '@/components/modals/GoalCreationModal.vue'
import { useRouter } from 'vue-router'

const authStore = useAuthStore()
const profileStore = useProfileStore()
const milestoneStore = useMilestoneStore()

const showCreateGoal = ref(false)
const showAddStep = ref(false)
const selectedHobbyForGoal = ref<string | undefined>(undefined)
const generatingSteps = ref(false)

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

// Methods
const createGoalForHobby = async (hobby: string) => {
  // Prevent opening modal until goals are loaded and no active goal exists
  if (loading.value) return
  if (authStore.user && authStore.user.id) {
    await milestoneStore.loadUserGoals(authStore.user.id)
    if (milestoneStore.currentGoal) {
      await milestoneStore.loadGoalSteps(milestoneStore.currentGoal.id)
    }
  }
  if (milestoneStore.currentGoal && milestoneStore.currentGoal.isActive) {
    alert('You already have an active goal. Please complete or close it first.')
    return
  }
  selectedHobbyForGoal.value = hobby
  showCreateGoal.value = true
}

const generateStepsForCurrentGoal = async () => {
  if (!currentGoal.value) return

  generatingSteps.value = true
  try {
    await milestoneStore.generateSteps(currentGoal.value.id)
  } catch (error) {
    console.error('Failed to generate steps:', error)
    alert('Failed to generate steps. Please try again.')
  } finally {
    generatingSteps.value = false
  }
}

const completeStep = async (stepId: string) => {
  try {
    await milestoneStore.completeStep(stepId)
    // If all steps are now complete, reload goal state to trigger achievement section
    if (currentGoal.value && goalProgress.value === 100 && authStore.user) {
      await milestoneStore.loadUserGoals(authStore.user.id)
      await milestoneStore.loadGoalSteps(currentGoal.value.id)
    }
  } catch (error) {
    console.error('Failed to complete step:', error)
    alert('Failed to complete step. Please try again.')
  }
}

const isNextStep = (index: number) => {
  // The next step is the first incomplete step
  const steps = currentGoalSteps.value
  for (let i = 0; i < steps.length; i++) {
    const step = steps[i]
    if (step && step.isComplete === false) {
      return i === index
    }
  }
  return false
}

const formatDate = (dateString: string) => {
  return new Date(dateString).toLocaleDateString()
}

const router = useRouter()
const handleGoalCreated = async (goalData: {
  description: string
  steps: string[]
  hobby: string
}) => {
  showCreateGoal.value = false
  selectedHobbyForGoal.value = undefined
  if (authStore.user) {
    // Always reload user goals and steps after modal closes to ensure UI is up to date
    await milestoneStore.loadUserGoals(authStore.user.id)
    if (milestoneStore.currentGoal && milestoneStore.currentGoal.id) {
      await milestoneStore.loadGoalSteps(milestoneStore.currentGoal.id)
    }
    // Optionally, navigate to milestones/progress page
    router.push('/dashboard/milestones')
  }
}

// Load data on mount
onMounted(async () => {
  if (authStore.user) {
    // Load goals and profile data
    await Promise.all([
      milestoneStore.loadUserGoals(authStore.user.id),
      profileStore.loadProfile(authStore.user.id),
    ])

    // If there's an active goal, load its steps
    if (currentGoal.value) {
      await milestoneStore.loadGoalSteps(currentGoal.value.id)
    }
  }
})
</script>

<style scoped>
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

.or-divider {
  color: #999;
  margin: 1rem 0;
  font-style: italic;
}

.create-goal-button {
  background: linear-gradient(135deg, #81c784 0%, #388e3c 100%);
  color: white;
  border: none;
  padding: 1rem 2rem;
  border-radius: 50px;
  font-size: 1.1rem;
  font-weight: 600;
  cursor: pointer;
  transition: background 0.2s, color 0.2s;
}

.create-goal-button:hover {
  transform: translateY(-2px);
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

.get-started-tips a  {
  color: #388e3c;
  text-decoration: none;
  font-weight: 600;
  border-radius: 999px;
  transition: background 0.2s, color 0.2s
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

.new-goal-button {
  background: transparent;
  color: #667eea;
  border: 2px solid #388e3c;
  padding: 0.75rem 1.5rem;
  border-radius: 8px;
  cursor: pointer;
  transition: all 0.2s;
}

.new-goal-button:hover {
  background: #388e3c;
  color: white;
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

.steps-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 2rem;
}

.steps-header h3 {
  margin: 0;
  color: #333;
  font-size: 1.3rem;
}

.generate-steps-button {
  background: linear-gradient(135deg, #81c784, #388e3c);
  color: white;
  border: none;
  padding: 0.75rem 1.5rem;
  border-radius: 8px;
  cursor: pointer;
  transition: transform 0.2s;
}

.generate-steps-button:hover:not(:disabled) {
  transform: translateY(-2px);
}

.generate-steps-button:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

.generating-steps {
  text-align: center;
  padding: 3rem 1rem;
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

.generating-steps p {
  color: #666;
  margin: 0;
}

.no-steps {
  text-align: center;
  padding: 3rem 1rem;
  color: #666;
}

.no-steps p {
  margin-bottom: 1.5rem;
}

.add-step-button {
  background: transparent;
  color: #388e3c;
  border: 2px solid #388e3c;
  padding: 0.75rem 1.5rem;
  border-radius: 8px;
  cursor: pointer;
  transition: all 0.2s;
}

.add-step-button:hover {
  background: #388e3c;
  color: white;
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
.close-goal-icon {
  font-size: 1.3em;
  display: flex;
  align-items: center;
}
</style>
