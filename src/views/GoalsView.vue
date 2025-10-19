<template>
  <div class="goals-view">
    <div class="goals-header">
      <h1>My Goals</h1>
      <button @click="showCreateGoal = true" class="create-button">+ Create Goal</button>
    </div>

    <div v-if="loading" class="loading-state">Loading your goals...</div>

    <div v-else-if="goals.length === 0" class="empty-state">
      <div class="empty-content">
        <svg class="empty-icon" viewBox="0 0 20 20" fill="currentColor">
          <path
            fill-rule="evenodd"
            d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
            clip-rule="evenodd"
          />
        </svg>
        <h3>No goals yet</h3>
        <p>Create your first goal to start tracking your hobby progress!</p>
        <button @click="showCreateGoal = true" class="empty-action-button">
          Create Your First Goal
        </button>
      </div>
    </div>

    <div v-else class="goals-grid">
      <GoalCard
        v-for="goal in goals"
        :key="goal.id"
        :goal="goal"
        @view="viewGoal"
        @delete="deleteGoal"
      />
    </div>

    <!-- Create Goal Modal -->
    <GoalCreationModal
      v-if="showCreateGoal"
      @close="showCreateGoal = false"
      @goalCreated="createGoal"
    />
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { useAuthStore } from '@/stores/auth'
import { useMilestoneStore } from '@/stores/milestone'
import GoalCard from '@/components/goals/GoalCard.vue'
import GoalCreationModal from '@/components/modals/GoalCreationModal.vue'

const router = useRouter()
const authStore = useAuthStore()
const milestoneStore = useMilestoneStore()

const user = computed(() => authStore.user)
const goals = computed(() => milestoneStore.goals)
const loading = computed(() => milestoneStore.loading)

const showCreateGoal = ref(false)

const viewGoal = (goalId: string) => {
  router.push(`/dashboard/goals/${goalId}`)
}

const createGoal = async (goalData: { description: string }) => {
  if (!user.value) return

  await milestoneStore.createGoal(user.value.id, goalData.description)
  showCreateGoal.value = false
}

const deleteGoal = async (goalId: string) => {
  if (confirm('Are you sure you want to delete this goal?')) {
    await milestoneStore.deleteGoal(goalId)
  }
}

onMounted(async () => {
  if (user.value) {
    await milestoneStore.loadUserGoals(user.value.id)
  }
})
</script>

<style scoped>
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
  background: #667eea;
  color: white;
  border: none;
  padding: 1rem 2rem;
  border-radius: 8px;
  cursor: pointer;
  font-weight: 500;
  font-size: 1rem;
}

.empty-action-button:hover {
  background: #5a6fd8;
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
