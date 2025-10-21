<template>
  <div class="dashboard-overview">
    <div class="welcome-section">
      <h1>Welcome back, {{ displayName }}! 🎯</h1>
      <p>Here's what's happening with your hobbies today.</p>
    </div>

    <div class="stats-grid">
      <div class="stat-card">
        <div class="stat-icon">🎯</div>
        <div class="stat-content">
          <h3>{{ goals.length }}</h3>
          <p>Active Goals</p>
        </div>
      </div>

      <div class="stat-card">
        <div class="stat-icon">🎨</div>
        <div class="stat-content">
          <h3>{{ hobbies.length }}</h3>
          <p>Hobbies</p>
        </div>
      </div>

      <div class="stat-card">
        <div class="stat-icon">📈</div>
        <div class="stat-content">
          <h3>{{ completedGoalsCount }}</h3>
          <p>Completed Goals</p>
        </div>
      </div>

      <div class="stat-card">
        <div class="stat-icon">🔥</div>
        <div class="stat-content">
          <h3>{{ streakDays }}</h3>
          <p>Day Streak</p>
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
          <div class="action-icon">🎨</div>
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
      <h2>Recent Goals</h2>
      <div class="goals-list">
        <div
          v-for="goal in recentGoals"
          :key="goal.id"
          class="goal-item"
          @click="$router.push('/dashboard/milestones')"
        >
          <div class="goal-info">
            <h4>{{ goal.description }}</h4>
            <p>Date started: {{ goal.createdAt ? formatDate(goal.createdAt) : 'No Date' }}</p>
            <p style="color: #888; font-size: 0.85em">
              <strong>Debug:</strong>
              isActive={{ goal.isActive ? 'true' : 'false' }}, completed={{
                goal.completed ? 'true' : 'false'
              }}
            </p>
          </div>
          <div class="goal-status">
            <span
              class="status-badge"
              :class="{ completed: !goal.isActive, active: goal.isActive }"
            >
              <template v-if="!goal.isActive">Completed</template>
              <template v-else>In Progress</template>
            </span>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed, onMounted, watch } from 'vue'
import { useAuthStore } from '@/stores/auth'
import { useProfileStore } from '@/stores/profile'
import { useMilestoneStore } from '@/stores/milestone'
import { formatDate } from '@/utils'

const authStore = useAuthStore()
const profileStore = useProfileStore()
const milestoneStore = useMilestoneStore()

const user = computed(() => authStore.user)
const hobbies = computed(() => profileStore.hobbies)
const goals = computed(() => milestoneStore.goals)

// Display name: use profile name if available, otherwise fallback to username
const displayName = computed(() => {
  return profileStore.profile?.name || user.value?.username || 'User'
})

const completedGoalsCount = computed(() => {
  return goals.value.filter((goal) => !goal.isActive).length
})

const streakDays = computed(() => {
  // Calculate streak as the number of days since the most recent goal started
  if (!goals.value.length) return 0
  // Find the most recent goal by createdAt
  const sortedGoals = [...goals.value].sort((a, b) => {
    return new Date(b.createdAt || '').getTime() - new Date(a.createdAt || '').getTime()
  })
  const mostRecentGoal = sortedGoals[0]
  if (!mostRecentGoal || !mostRecentGoal.createdAt) return 0
  const startDate = new Date(mostRecentGoal.createdAt)
  const now = new Date()
  // Calculate difference in days
  const diffTime = now.getTime() - startDate.getTime()
  const diffDays = Math.max(1, Math.floor(diffTime / (1000 * 60 * 60 * 24)))
  return diffDays
})

const recentGoals = computed(() => {
  // Show last 3 goals, including completed (inactive) and active
  return goals.value.slice(0, 3)
})

onMounted(async () => {
  if (user.value) {
    await Promise.all([
      profileStore.loadProfile(user.value.id),
      milestoneStore.loadUserGoals(user.value.id),
    ])
  }
})

// Watch for changes in milestoneStore.goals and reload from backend if a goal is completed
watch(
  () => milestoneStore.goals.map((g) => g.completed),
  async (newCompleted, oldCompleted) => {
    if (user.value && newCompleted.some((c, i) => c && !oldCompleted[i])) {
      // A goal was just completed, reload goals from backend
      await milestoneStore.loadUserGoals(user.value.id)
    }
  },
)
</script>

<style scoped>
.dashboard-overview {
  width: 100%;
  padding: 0;
}

.welcome-section {
  margin-bottom: 2rem;
}

.welcome-section h1 {
  margin: 0 0 0.5rem 0;
  color: #333;
  font-size: 2rem;
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
  background: white;
  border-radius: 12px;
  padding: 1.5rem;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
  display: flex;
  align-items: center;
  gap: 1rem;
}

.stat-icon {
  font-size: 2.5rem;
  flex-shrink: 0;
}

.stat-content h3 {
  margin: 0 0 0.25rem 0;
  color: #333;
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
  color: #333;
  font-size: 1.5rem;
}

.actions-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
  gap: 1.5rem;
}

.action-card {
  background: white;
  border-radius: 12px;
  padding: 1.5rem;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
  text-decoration: none;
  color: inherit;
  transition: all 0.2s;
  text-align: center;
}

.action-card:hover {
  box-shadow: 0 4px 16px rgba(0, 0, 0, 0.1);
  transform: translateY(-2px);
}

.action-icon {
  font-size: 3rem;
  margin-bottom: 1rem;
}

.action-card h3 {
  margin: 0 0 0.5rem 0;
  color: #333;
  font-size: 1.2rem;
}

.action-card p {
  margin: 0;
  color: #666;
  font-size: 0.9rem;
  line-height: 1.4;
}

.goals-list {
  background: white;
  border-radius: 12px;
  overflow: hidden;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
}

.goal-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 1rem 1.5rem;
  border-bottom: 1px solid #e9ecef;
  cursor: pointer;
  transition: background-color 0.2s;
}

.goal-item:last-child {
  border-bottom: none;
}

.goal-item:hover {
  background: #f8f9fa;
}

.goal-info h4 {
  margin: 0 0 0.25rem 0;
  color: #333;
  font-size: 1rem;
}

.goal-info p {
  margin: 0;
  color: #666;
  font-size: 0.85rem;
}

.status-badge {
  background: #eee;
  color: #666;
  padding: 0.25rem 0.75rem;
  border-radius: 12px;
  font-size: 0.75rem;
  font-weight: 500;
  text-transform: uppercase;
  letter-spacing: 0.5px;
  transition:
    background 0.2s,
    color 0.2s;
}

.status-badge.completed {
  background: #43a047;
  color: #fff;
  box-shadow: 0 2px 8px rgba(67, 160, 71, 0.15);
}

@media (max-width: 768px) {
  .welcome-section h1 {
    font-size: 1.5rem;
  }

  .stats-grid {
    grid-template-columns: repeat(auto-fit, minmax(150px, 1fr));
    gap: 1rem;
  }

  .stat-card {
    padding: 1rem;
  }

  .stat-icon {
    font-size: 2rem;
  }

  .actions-grid {
    grid-template-columns: 1fr;
  }

  .goal-item {
    flex-direction: column;
    align-items: flex-start;
    gap: 0.5rem;
  }
}
</style>
