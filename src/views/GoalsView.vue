<template>
  <div class="goals-view">
    <div v-if="goalError" class="error-message">
      <svg
        width="20"
        height="20"
        viewBox="0 0 20 20"
        fill="none"
        style="vertical-align: middle; margin-right: 0.5em"
      >
        <circle cx="10" cy="10" r="10" fill="#ffcdd2" />
        <path d="M10 6v4m0 4h.01" stroke="#c00" stroke-width="2" stroke-linecap="round" />
      </svg>
      <span>{{ goalError }}</span>
    </div>

    <div class="goals-header">
      <h1>My Goals</h1>
      <div class="hobby-select-group">
        <label for="hobby-select" style="margin-right: 0.5rem; font-weight: 500; color: #388e3c">
          Select Hobby:
        </label>
        <select id="hobby-select" v-model="selectedHobby" class="hobby-dropdown">
          <option v-for="hobby in profileStore.hobbies" :key="hobby" :value="hobby">
            {{ hobby }}
          </option>
        </select>
      </div>
      <button
        @click="showCreateGoal = true"
        class="create-button"
        :disabled="!hasHobbies"
        :title="!hasHobbies ? 'Add a hobby first to create a goal.' : ''"
      >
        + Create Goal
      </button>
    </div>

    <div v-if="filteredGoals.length === 0" class="empty-state">
      <div class="empty-content">
        <svg class="empty-icon" viewBox="0 0 20 20" fill="currentColor">
          <path
            fill-rule="evenodd"
            d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
            clip-rule="evenodd"
          />
        </svg>
        <h3>No goals yet</h3>
        <p>Create Your First Goal to start tracking your hobby progress!</p>
        <button
          @click="showCreateGoal = true"
          class="empty-action-button"
          :disabled="!hasHobbies"
          :title="!hasHobbies ? 'Add a hobby first to create a goal.' : ''"
        >
          Create Your First Goal
        </button>
        <div v-if="!hasHobbies" style="color: #c00; margin-top: 1rem; font-size: 1rem">
          You must add at least one hobby before creating a goal.
        </div>
      </div>
    </div>

    <div v-else class="goals-grid">
      <GoalCard
        v-for="goal in filteredGoals"
        :key="goal.id"
        :goal="goal"
        @view="viewGoal"
        @delete="deleteGoal"
      />
    </div>

    <!-- Create Goal Modal -->
    <GoalCreationModal
      v-if="showCreateGoal && hasHobbies"
      :hobby="selectedHobby"
      @close="showCreateGoal = false"
      @goalCreated="createGoal"
    />
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { useProfileStore } from '@/stores/profile'
import { useAuthStore } from '@/stores/auth'

const router = useRouter()
const profileStore = useProfileStore()
const authStore = useAuthStore()
const hasHobbies = computed(() => profileStore.hobbies.length > 0)
const selectedHobby = ref('')
const showCreateGoal = ref(false)
const localGoals = ref<Array<{ id: string; description: string; steps: string[]; hobby: string }>>(
  [],
)
const goalError = ref('')

const filteredGoals = computed(() => {
  if (!selectedHobby.value) return []
  return localGoals.value.filter((g) => g.hobby === selectedHobby.value)
})

function viewGoal(goalId: string) {
  const goal = localGoals.value.find((g) => g.id === goalId)
  if (goal) alert(`Goal: ${goal.description}\nSteps: ${goal.steps.join(', ')}`)
}

function createGoal(goalData: { description: string; steps: string[]; hobby: string }) {
  // Add new goal to local array
  localGoals.value.push({
    id: Math.random().toString(36).substr(2, 9),
    description: goalData.description,
    steps: goalData.steps,
    hobby: goalData.hobby,
  })
  showCreateGoal.value = false
}

function deleteGoal(goalId: string) {
  if (confirm('Are you sure you want to delete this goal?')) {
    localGoals.value = localGoals.value.filter((g) => g.id !== goalId)
  }
}

onMounted(async () => {
  const user = authStore.user
  if (user) {
    await profileStore.loadProfile()
    if (profileStore.hobbies.length > 0) {
      selectedHobby.value = profileStore.hobbies[0] ?? ''
    } else {
      selectedHobby.value = ''
    }
  }
})
</script>

<style scoped>
.error-message {
  background: #ffcdd2;
  color: #c00;
  border: 1px solid #e57373;
  border-radius: 8px;
  padding: 0.75em 1.25em;
  margin-bottom: 1.5em;
  font-size: 1.05em;
  display: flex;
  align-items: center;
  box-shadow: 0 2px 8px rgba(200, 0, 0, 0.07);
}

/* Dropdown styles */
.hobby-select-group {
  display: flex;
  align-items: center;
  gap: 1rem;
}
.hobby-dropdown {
  padding: 0.5rem 1rem;
  border-radius: 8px;
  border: 1px solid #81c784;
  font-size: 1rem;
  color: #388e3c;
  background: #e8f5e9;
  outline: none;
}
.goals-view {
  width: 100%;
  padding: 0;
}

.goals-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 2rem;
}

.goals-header h1 {
  margin: 0;
  color: #333;
}

.create-button {
  background: #28a745;
  color: white;
  border: none;
  padding: 0.75rem 1.5rem;
  border-radius: 8px;
  cursor: pointer;
  font-weight: 500;
  font-size: 1rem;
}

.create-button:hover {
  background: #218838;
}

.loading-state {
  text-align: center;
  padding: 4rem 2rem;
  color: #666;
  font-size: 1.1rem;
}

.empty-state {
  display: flex;
  justify-content: center;
  align-items: center;
  min-height: 400px;
}

.empty-content {
  text-align: center;
  max-width: 400px;
}

.empty-icon {
  width: 80px;
  height: 80px;
  color: #ccc;
  margin-bottom: 1rem;
}

.empty-content h3 {
  margin: 0 0 0.5rem 0;
  color: #666;
  font-size: 1.5rem;
}

.empty-content p {
  margin: 0 0 2rem 0;
  color: #888;
  line-height: 1.5;
}

.empty-action-button {
  background: #388e3c;
  color: white;
  border: none;
  padding: 1rem 2rem;
  border-radius: 8px;
  cursor: pointer;
  font-weight: 500;
  font-size: 1rem;
}

.empty-action-button:hover {
  background: #388e3c;
}

.goals-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(350px, 1fr));
  gap: 1.5rem;
}

@media (max-width: 768px) {
  .goals-header {
    flex-direction: column;
    gap: 1rem;
    text-align: center;
  }

  .goals-grid {
    grid-template-columns: 1fr;
    gap: 1rem;
  }
}
</style>
