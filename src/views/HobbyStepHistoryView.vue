<template>
  <div class="hobby-step-history-view">
    <h1>{{ hobbyName }} History</h1>
    <div v-if="loading" class="loading">Loading step history...</div>
    <div v-else-if="goals.length === 0" class="empty">No goals found for this hobby.</div>
    <div v-else>
      <div class="goal-sort-control">
        <label for="goalSort">Sort goals by:</label>
        <select id="goalSort" v-model="goalSortOrder">
          <option value="mostSteps">Most Steps</option>
          <option value="fewestSteps">Fewest Steps</option>
          <option value="recentCompletion">Most Recently Completed</option>
          <option value="leastRecentCompletion">Least Recently Completed</option>
          <option value="activeFirst">Active Goals First</option>
          <option value="inactiveFirst">Inactive Goals First</option>
          <option value="shortestDuration">Shortest Duration</option>
          <option value="longestDuration">Longest Duration</option>
        </select>
      </div>
      <div v-for="(goal, goalIdx) in sortedGoals" :key="goal.id" class="goal-section">
        <div class="goal-header-row" @click="toggleGoal(goal.id)" style="cursor: pointer">
          <button class="collapse-btn" @click.stop="toggleGoal(goal.id)">
            <span v-if="openGoals[goal.id]">▼</span>
            <span v-else>▶</span>
          </button>
          <h2 class="goal-title">Goal: {{ goal.description }}</h2>
          <span class="goal-status-label">{{ goal.isActive ? 'Active' : 'Inactive' }}</span>
          <span
            class="goal-start-label"
            v-if="
              goal.steps && goal.steps.length && (goal.steps[0].start || goal.steps[0].createdAt)
            "
            style="margin-left: 1.2rem; font-size: 0.98rem; color: #666; font-weight: 400"
          >
            Started at: {{ formatDate(goal.steps[0].start || goal.steps[0].createdAt) }}
          </span>
          <span class="goal-duration-label">
            <template v-if="getGoalDuration(goal) !== null">
              <span v-if="goal.isActive">Time since started: </span>
              <span v-else>Time spent on goal: </span>
              <strong>{{ getGoalDuration(goal) }}</strong>
            </template>
          </span>
        </div>
        <ul v-show="openGoals[goal.id]" class="steps-list">
          <li
            v-for="(step, idx) in goal.steps"
            :key="step.id"
            :class="['step-card', { complete: step.isComplete }]"
            :style="
              (() => {
                const colorPair = stepColors[idx % stepColors.length] || {
                  background: '#e8f5e9',
                  color: '#388e3c',
                }
                return {
                  background: colorPair.background,
                  color: colorPair.color,
                }
              })()
            "
          >
            <div class="step-header">
              <span
                class="step-number"
                :style="{ color: stepColors[idx % stepColors.length]?.color || '#388e3c' }"
              >
                <strong>{{ idx + 1 }}.</strong>
              </span>
              <span class="step-desc">{{ step.description }}</span>
            </div>
            <div class="step-dates">
              <span
                v-if="step.isComplete && (step.completedAt || step.completion)"
                class="step-date"
              >
                <strong>Completed:</strong> {{ formatDate(step.completedAt || step.completion) }}
              </span>
              <span v-else-if="!step.isComplete" class="step-date not-completed"
                >Not completed</span
              >
            </div>
          </li>
        </ul>
      </div>
    </div>
    <router-link class="back-link" :to="{ name: 'profile' }">← Back to Profile</router-link>
  </div>
</template>

<script setup lang="ts">
// Returns a human readable duration string (e.g. '2d 3h 4m') between two dates
function formatDuration(ms: number): string {
  if (ms < 0) return ''
  const min = 60 * 1000
  const hour = 60 * min
  const day = 24 * hour
  const days = Math.floor(ms / day)
  const hours = Math.floor((ms % day) / hour)
  const mins = Math.floor((ms % hour) / min)
  let out = []
  if (days > 0) out.push(`${days}d`)
  if (hours > 0) out.push(`${hours}h`)
  if (mins > 0 || out.length === 0) out.push(`${mins}m`)
  return out.join(' ')
}

// Returns ms between start and end (or now if not complete)
function getGoalDurationMs(goal: any): number | null {
  if (!goal.steps || !Array.isArray(goal.steps) || goal.steps.length === 0) return null
  const start = goal.steps[0]?.start || goal.steps[0]?.createdAt
  if (!start) return null
  if (goal.isActive) {
    return Date.now() - new Date(start).getTime()
  }
  // completed: use latest completedAt/completion
  const completed = goal.steps.map((s: any) => s.completion || s.completedAt).filter(Boolean)
  if (completed.length === 0) return null
  const end = completed.reduce((latest: string, curr: string) =>
    new Date(curr) > new Date(latest) ? curr : latest,
  )
  return new Date(end).getTime() - new Date(start).getTime()
}

function getGoalDuration(goal: any): string | null {
  const ms = getGoalDurationMs(goal)
  if (ms === null) return null
  return formatDuration(ms)
}
import { reactive } from 'vue'

const openGoals = reactive<Record<string, boolean>>({})

function toggleGoal(goalId: string) {
  openGoals[goalId] = !openGoals[goalId]
}

import { ref, onMounted, computed } from 'vue'
import { useRoute } from 'vue-router'
import { ApiService } from '@/services/api'
import { useAuthStore } from '@/stores/auth'

const route = useRoute()
const authStore = useAuthStore()

const hobbyName = computed(() => route.params.hobby as string)
const userId = computed(() => authStore.user?.id)

const loading = ref(true)
const goals = ref<any[]>([])

const goalSortOrder = ref<
  | 'mostSteps'
  | 'fewestSteps'
  | 'recentCompletion'
  | 'leastRecentCompletion'
  | 'activeFirst'
  | 'inactiveFirst'
>('recentCompletion')

const sortedGoals = computed(() => {
  if (!goals.value) return []
  let arr = [...goals.value]
  if (goalSortOrder.value === 'mostSteps') {
    arr.sort((a, b) => (b.steps?.length || 0) - (a.steps?.length || 0))
  } else if (goalSortOrder.value === 'fewestSteps') {
    arr.sort((a, b) => (a.steps?.length || 0) - (b.steps?.length || 0))
  } else if (goalSortOrder.value === 'recentCompletion') {
    arr.sort((a, b) => {
      const aDate = getGoalCompletedDate(a)
      const bDate = getGoalCompletedDate(b)
      if (!aDate && !bDate) return 0
      if (!aDate) return 1
      if (!bDate) return -1
      return new Date(bDate).getTime() - new Date(aDate).getTime()
    })
  } else if (goalSortOrder.value === 'leastRecentCompletion') {
    arr.sort((a, b) => {
      const aDate = getGoalCompletedDate(a)
      const bDate = getGoalCompletedDate(b)
      if (!aDate && !bDate) return 0
      if (!aDate) return 1
      if (!bDate) return -1
      return new Date(aDate).getTime() - new Date(bDate).getTime()
    })
  } else if (goalSortOrder.value === 'activeFirst') {
    arr.sort((a, b) => {
      if (a.isActive === b.isActive) return 0
      return a.isActive ? -1 : 1
    })
  } else if (goalSortOrder.value === 'inactiveFirst') {
    arr.sort((a, b) => {
      if (a.isActive === b.isActive) return 0
      return a.isActive ? 1 : -1
    })
  } else if (goalSortOrder.value === 'shortestDuration') {
    arr.sort((a, b) => {
      const aDur = getGoalDurationMs(a)
      const bDur = getGoalDurationMs(b)
      if (aDur === null && bDur === null) return 0
      if (aDur === null) return 1
      if (bDur === null) return -1
      return aDur - bDur
    })
  } else if (goalSortOrder.value === 'longestDuration') {
    arr.sort((a, b) => {
      const aDur = getGoalDurationMs(a)
      const bDur = getGoalDurationMs(b)
      if (aDur === null && bDur === null) return 0
      if (aDur === null) return 1
      if (bDur === null) return -1
      return bDur - aDur
    })
  }
  return arr
})

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

function formatDate(dateStr: string | undefined) {
  if (!dateStr) return ''
  const d = new Date(dateStr)
  const date = d.toLocaleDateString(undefined, { year: 'numeric', month: 'short', day: 'numeric' })
  const time = d.toLocaleTimeString(undefined, { hour: '2-digit', minute: '2-digit' })
  return `${date} at ${time}`
}

onMounted(async () => {
  if (!userId.value || !hobbyName.value) return
  loading.value = true
  try {
    // 1. Get all goals for this user and hobby
    const result = await ApiService.callConceptAction<any>('MilestoneTracker', '_getGoal', {
      user: userId.value,
      hobby: hobbyName.value,
    })

    // Extract goals array from response object
    const allGoals = result?.goals || result

    if (!Array.isArray(allGoals)) {
      goals.value = []
      return
    }

    // Map backend field names to frontend field names
    const mappedGoals = allGoals.map((g) => ({
      id: g.goalId || g.id,
      description: g.goalDescription || g.description,
      hobby: g.goalHobby || g.hobby,
      isActive: g.goalIsActive ?? g.isActive ?? true,
      completed: g.completed ?? false,
    }))

    // 2. For each goal, get its steps
    const goalsWithSteps = await Promise.all(
      mappedGoals.map(async (goal) => {
        try {
          const stepsResult = await ApiService.callConceptAction<any>(
            'MilestoneTracker',
            '_getSteps',
            {
              goalId: goal.id,
            },
          )
          const stepsArray = stepsResult?.steps || stepsResult
          return { ...goal, steps: Array.isArray(stepsArray) ? stepsArray : [] }
        } catch (err) {
          return { ...goal, steps: [] }
        }
      }),
    )
    goals.value = goalsWithSteps
  } catch (err) {
    goals.value = []
  } finally {
    loading.value = false
  }
})

// Color pairs for step cards
const stepColors = [
  { background: '#f3e5f5', color: '#6a1b9a' },
  { background: '#fbe9e7', color: '#d84315' },
  { background: '#e3f2fd', color: '#1565c0' },
  { background: '#fffde7', color: '#f9a825' },
  { background: '#fce4ec', color: '#ad1457' },
  { background: '#e8f5e9', color: '#388e3c' },
  { background: '#d1f3ff', color: '#38778e' },
]
</script>

<style scoped>
.goal-duration-label {
  margin-left: 1.2rem;
  font-size: 0.98rem;
  color: #38778e;
  font-weight: 500;
}
.goal-header-row {
  display: flex;
  align-items: baseline;
  gap: 1.2rem;
  margin-bottom: 0.3rem;
  background: #e8f5e9;
  border-radius: 12px;
  border: 2px solid #c8e6c9;
  padding: 1.1rem 1.5rem 1.1rem 1.5rem;
  font-size: 1.13rem;
  font-weight: 600;
}
.step-status {
  font-size: 0.98rem;
  color: #888;
  font-weight: 500;
}
.step-status.done {
  color: #388e3c;
}
.step-body {
  margin-bottom: 0.2rem;
}
.step-desc {
  font-size: 1.05rem;
}
.step-dates {
  display: flex;
  gap: 1.5rem;
  font-size: 0.97rem;
  color: #666;
  margin-top: 0.1rem;
}
.step-date strong {
  color: #333;
  font-weight: 500;
}
.step-date.not-completed {
  color: #c62828;
  font-weight: 500;
}
.collapse-btn {
  background: none;
  border: none;
  font-size: 1.1rem;
  margin-right: 0.5rem;
  cursor: pointer;
  color: #388e3c;
  padding: 0;
  line-height: 1;
}
.hobby-step-history-view {
  max-width: 700px;
  margin: 0 auto;
  padding: 2rem 1rem;
}
.loading,
.empty {
  text-align: center;
  color: #666;
  margin: 2rem 0;
}
.goal-sort-control {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  margin-bottom: 1.5rem;
}
.goal-sort-control label {
  font-weight: 500;
  color: #333;
}
.goal-sort-control select {
  padding: 0.3rem 0.7rem;
  border: 1px solid #bce7bd;
  border-radius: 6px;
  font-size: 1rem;
  cursor: pointer;
}
.goal-section {
  margin-bottom: 2.5rem;
}
.goal-header-row {
  display: flex;
  align-items: baseline;
  gap: 1.2rem;
  margin-bottom: 0.3rem;
  background: #e8f5e9;
  border-radius: 12px;
  border: none;
  padding: 1.1rem 1.5rem 1.1rem 1.5rem;
  font-size: 1.13rem;
  font-weight: 600;
}
.goal-status-label {
  font-size: 1rem;
  font-weight: 600;
  letter-spacing: 0.5px;
  margin-left: 0.5rem;
}
.goal-section h2 {
  font-size: 1.2rem;
  color: #388e3c;
  margin-bottom: 0.7rem;
}
.steps-list {
  list-style: none;
  padding: 0;
  margin: 0;
}
.steps-list li {
  padding: 0.7rem 1rem;
  border-radius: 8px;
  margin-bottom: 0.5rem;

  display: flex;
  justify-content: space-between;
  align-items: center;
  font-size: 1rem;
}

.step-number {
  font-weight: 600;
  margin-right: 0.7rem;
  color: #38778e;
}
.step-desc {
  flex: 1;
}
.step-date {
  font-size: 0.95rem;
  color: #888;
  margin-left: 1.2rem;
}
.back-link {
  display: inline-flex;
  align-items: center;
  gap: 0.5em;
  margin-top: 2rem;
  color: #388e3c;
  border: none;
  background: #e8f5e9;
  text-decoration: none;
  font-weight: 500;
  border-radius: 8px;
  padding: 0.5rem 1.2rem;

  font-size: 1rem;
  transition:
    background 0.2s,
    color 0.2s,
    border 0.2s;
}
.back-link:hover {
  background: #c8e6c9;
  color: #256029;
  border-color: #256029;
  text-decoration: none;
}
</style>
