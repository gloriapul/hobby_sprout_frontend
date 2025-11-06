<template>
  <div class="dashboard-overview">
    <div class="welcome-section">
      <h1>Welcome back, {{ displayName }}!</h1>
      <p>Ready to continue your hobby journey?</p>
    </div>

    <div class="stats-grid">
      <div class="stat-card">
        <div class="stat-icon">🥇</div>
        <div class="stat-content">
          <h3>
            <span v-if="allGoalsLoading" class="spinner"></span>
            <span v-else>{{ allGoals.length ? allGoals.length : 0 }}</span>
          </h3>
          <p>Total Goals</p>
        </div>
      </div>

      <div class="stat-card">
        <div class="stat-icon">🎨</div>
        <div class="stat-content">
          <h3>{{ hobbies.length ? hobbies.length : 0 }}</h3>
          <p>Hobbies</p>
        </div>
      </div>
    </div>

    <div class="quick-actions">
      <h2>Quick Actions</h2>
      <div class="actions-grid">
        <router-link to="/dashboard/goals" class="action-card">
          <div class="action-icon">🎯</div>
          <h3>Create Goal</h3>
          <p>Set a new hobby goal to work towards</p>
        </router-link>

        <router-link to="/dashboard/profile" class="action-card">
          <div class="action-icon">🎤</div>
          <h3>Add Hobby</h3>
          <p>Discover and add new hobbies to explore</p>
        </router-link>
        <router-link to="/dashboard/quiz" class="action-card">
          <div class="action-icon">❓</div>
          <h3>Take Quiz</h3>
          <p>Find hobbies that match your personality</p>
        </router-link>
      </div>
    </div>

    <div v-if="recentGoals.length > 0" class="recent-activity">
      <h2>Active Goal</h2>
      <div class="goals-list">
        <div v-if="recentGoals[0]" class="goal-item" @click="$router.push('/dashboard/milestones')">
          <div class="goal-info">
            <h4>{{ recentGoals[0].description }}</h4>
            <p>
              Date started:
              {{ recentGoals[0].createdAt ? formatDate(recentGoals[0].createdAt) : 'No Date' }}
            </p>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, watch } from 'vue'
const error = ref<string | null>(null)
import { useAuthStore } from '@/stores/auth'
import { useProfileStore } from '@/stores/profile'
import { useMilestoneStore } from '@/stores/milestone'
import { ApiService } from '@/services/api'
import { formatDate } from '@/utils'
const allGoals = ref<any[]>([])
const allGoalsLoading = ref(true)

const authStore = useAuthStore()
const profileStore = useProfileStore()
const milestoneStore = useMilestoneStore()

const user = computed(() => authStore.user)
const hobbies = computed(() => profileStore.hobbies)
const goals = computed(() => milestoneStore.goals)

// Display name: use profile name if available, otherwise fallback to username
const displayName = computed(() => {
  return profileStore.profile?.name || user.value?.username
})

const recentGoals = computed(() => {
  return goals.value.filter((g) => g.isActive).slice(0, 1)
})

async function reloadAllGoals() {
  allGoalsLoading.value = true
  try {
    // Use the new getGoals query to fetch all goals for the user
    const response = await ApiService.callConceptAction<any>('MilestoneTracker', '_getGoals', {})
    // The backend returns an array directly (not {goals: [...]})
    const goalsArray = Array.isArray(response.goals) ? response.goals : []
    allGoals.value = goalsArray.map((g: any) => ({
      id: g.goalId || g.id,
      description: g.goalDescription || g.description,
      hobby: g.goalHobby || g.hobby,
      isActive: g.goalIsActive ?? g.isActive ?? true,
      completed: g.completed ?? false,
    }))
  } catch (err) {
    allGoals.value = []
  }
  allGoalsLoading.value = false
}

onMounted(async () => {
  if (user.value) {
    // Load profile and goals with error handling
    try {
      await profileStore.loadProfile() // Session token is used, not user ID
    } catch (err) {
      // Continue loading goals even if profile fails
      error.value = 'Failed to load profile'
    }

    try {
      await milestoneStore.loadUserGoals()
      await reloadAllGoals()
    } catch (err) {
      error.value = 'Failed to load goals'
    }
  }
})

// Only watch for changes in the goals array length, not deep changes
// This prevents infinite loops while still detecting when goals are added/removed
watch(
  () => milestoneStore.goals.length,
  async (newLength, oldLength) => {
    // Only reload if length actually changed and it's not the initial load
    if (oldLength !== undefined && newLength !== oldLength) {
      await reloadAllGoals()
    }
  },
)
</script>

<style scoped>
.dashboard-overview {
  width: 100%;
  padding: 0;

  background: #fff;
}

.welcome-section {
  margin-bottom: 2rem;
}
.welcome-section h1 {
  margin: 0 0 0.5rem 0;
  color: #256b28;
  font-size: 2rem;
  font-weight: 500;
}
.welcome-section p {
  margin: 0;
  color: #666;
  font-size: 1.1rem;
}

.stats-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 1.5rem;
  margin-bottom: 3rem;
}
.stat-card {
  background: #e8f5e9;
  border-radius: 20px;
  padding: 1.5rem;
  display: flex;
  align-items: center;
  gap: 1rem;
}

.stat-icon {
  font-size: 2.5rem;
  flex-shrink: 0;
  color: #388e3c;
}
.stat-content h3,
.stat-content span {
  margin: 0 0 0.25rem 0;
  color: #256b28;
  font-size: 1.8rem;
  font-weight: 600;
}

.stat-content p {
  margin: 0;
  color: #666;
  font-size: 0.9rem;
}

.quick-actions,
.recent-activity {
  margin-bottom: 3rem;
}
.quick-actions h2,
.recent-activity h2 {
  margin: 0 0 1.5rem 0;
  color: #256b28;
  font-size: 1.5rem;
  font-weight: 500;
}
.actions-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
  gap: 1.5rem;
}
.action-card {
  background: #e8f5e9;
  border-radius: 20px;
  padding: 1.5rem;
  text-decoration: none;
  color: #256b28;
  border: 2px solid #bce7bd;
  transition:
    background 0.2s,
    color 0.2s,
    border 0.2s;
  text-align: center;
}
.action-card:hover {
  background: #bce7bd;
  color: #256b28;
  border-color: #388e3c;
  transform: none;
}
.action-icon {
  font-size: 3rem;
  margin-bottom: 1rem;
  color: #388e3c;
}
.action-card h3 {
  margin: 0 0 0.5rem 0;
  color: #256b28;
  font-size: 1.2rem;
  font-weight: 600;
}
.action-card p {
  margin: 0;
  color: #666;
  font-size: 0.9rem;
  line-height: 1.4;
}

.goals-list {
  background: #e8f5e9;
  border-radius: 16px;
  overflow: hidden;
}
.goal-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 1rem 1.5rem;
  border: 2px solid #bce7bd;
  border-radius: 16px;
  cursor: pointer;
  transition: background-color 0.2s;
}

.goal-item:hover {
  background: #bce7bd;
  border-color: #388e3c;
}
.goal-info h4 {
  margin: 0 0 0.25rem 0;
  color: #256b28;
  font-size: 1rem;
}
.goal-info p {
  margin: 0;
  color: #666;
  font-size: 0.85rem;
}
</style>
