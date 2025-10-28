<template>
  <div class="profile-view">
    <div class="profile-header">
      <h1>My Profile</h1>
      <button @click="toggleEditMode" class="base-btn edit-button">
        {{ isEditing ? 'Save Changes' : 'Edit Profile' }}
      </button>
    </div>

    <div class="profile-content">
      <!-- Profile Info Card -->
      <div class="profile-card">
        <div class="profile-info">
          <div class="avatar">
            <img v-if="profile?.image" :src="profile.image" :alt="profile.name" />
            <div v-else class="avatar-placeholder">
              {{ getInitials(profile?.name || user?.username || 'U') }}
            </div>
          </div>

          <div class="user-details">
            <div v-if="!isEditing" class="view-mode">
              <h2>{{ profile?.name || user?.username }}</h2>
              <p class="username">@{{ user?.username }}</p>
            </div>

            <div v-else class="edit-mode">
              <div class="form-group">
                <label for="name">Display Name</label>
                <input
                  id="name"
                  v-model="editForm.name"
                  type="text"
                  placeholder="Enter your display name"
                />
              </div>

              <div class="form-group">
                <label for="image">Profile Image URL</label>
                <input
                  id="image"
                  v-model="editForm.image"
                  type="url"
                  placeholder="Enter image URL"
                />
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- Hobbies Section -->
      <div class="hobbies-section">
        <div class="section-header">
          <h3>My Hobbies</h3>
          <div class="hobby-actions-row">
            <label for="hobbyFilter" class="hobby-filter-label">Filter by:</label>
            <select id="hobbyFilter" v-model="hobbyFilter" class="hobby-filter">
              <option value="active">Active</option>
              <option value="inactive">Inactive</option>
              <option value="all">All</option>
            </select>
            <button @click="showAddHobby = true" class="base-btn add-button">+ Add Hobby</button>
          </div>
        </div>

        <div v-if="loading" class="loading-state">Loading hobbies...</div>

        <div v-else-if="filteredHobbies.length === 0" class="empty-state">
          <p>No hobbies to show for this filter.</p>
        </div>

        <div v-else class="hobbies-grid">
          <div v-for="hobby in filteredHobbies" :key="hobby" class="hobby-card-wrapper">
            <HobbyCard :hobby="hobby" @click="handleHobbyClick(hobby)" />
            <router-link
              v-if="hobbyHasGoals(hobby)"
              class="view-step-history-link"
              :to="{ name: 'hobby-step-history', params: { hobby } }"
            >
              View Step History
            </router-link>
          </div>
        </div>

        <HobbyDetailModal
          v-if="showHobbyDetail && selectedHobby"
          :hobby="selectedHobby"
          :isActive="selectedHobbyIsActive"
          :goals="selectedHobbyGoals === null ? [] : selectedHobbyGoals"
          :loading="selectedHobbyGoals === null"
          @close="showHobbyDetail = false"
          @markInactive="markHobbyInactive"
          @markActive="markHobbyActive"
        />
      </div>
      <!-- Quiz History Section -->
      <div class="quiz-history-section">
        <div class="section-header">
          <h3>Quiz History</h3>
          <div style="display: flex; gap: 1rem; align-items: center; margin-left: auto">
            <div class="quiz-sort-control">
              <label for="quizSort">Sort by:</label>
              <select id="quizSort" v-model="quizSortOrder">
                <option value="desc">Most Recent</option>
                <option value="asc">Least Recent</option>
              </select>
            </div>
            <button
              v-if="sortedQuizHistory.length > 0"
              @click="clearQuizHistory"
              class="base-btn clear-history-btn"
            >
              Clear History
            </button>
          </div>
        </div>
        <div v-if="quizHistoryLoading" class="loading-state">Loading quiz history...</div>
        <div v-else-if="sortedQuizHistory.length === 0" class="empty-state">
          <p>No quiz results yet. Take the quiz to get your first hobby match!</p>
        </div>
        <div v-else class="quiz-history-grid">
          <div v-for="match in sortedQuizHistory" :key="match.id" class="quiz-history-card">
            <div class="quiz-history-hobby">{{ match.hobby }}</div>
            <div class="quiz-history-date">Matched on {{ formatDate(match.matchedAt) }}</div>
          </div>
        </div>
      </div>
    </div>

    <HobbyModal v-if="showAddHobby" @close="showAddHobby = false" @add="addHobby" />
  </div>
</template>

<script setup lang="ts">
// Helper to check if a hobby has at least one goal
const hobbyHasGoals = (hobby: string) => {
  if (Array.isArray(milestoneStore.goals)) {
    return milestoneStore.goals.some((g: any) => g.hobby === hobby)
  }
  return false
}
const quizSortOrder = ref<'desc' | 'asc'>('desc')
const sortedQuizHistory = computed(() => {
  return [...quizHistory.value].sort((a, b) => {
    const aTime = new Date(a.matchedAt).getTime()
    const bTime = new Date(b.matchedAt).getTime()
    return quizSortOrder.value === 'desc' ? bTime - aTime : aTime - bTime
  })
})

const markHobbyInactive = async (hobbyName: string) => {
  await profileStore.closeHobby(hobbyName)
  if (user.value) {
    await profileStore.loadProfile(user.value.id)
  }
  showHobbyDetail.value = false
}

const markHobbyActive = async (hobbyName: string) => {
  await profileStore.setHobby(hobbyName)
  if (user.value) {
    await profileStore.loadProfile(user.value.id)
  }
  showHobbyDetail.value = false
}
import { ref, computed, onMounted } from 'vue'
import { useAuthStore } from '@/stores/auth'
import { useProfileStore } from '@/stores/profile'
import { useMilestoneStore } from '@/stores/milestone'
import HobbyCard from '@/components/shared/HobbyCard.vue'
import HobbyModal from '@/components/modals/HobbyModal.vue'
import HobbyDetailModal from '@/components/shared/HobbyDetailModal.vue'

const authStore = useAuthStore()
const profileStore = useProfileStore()
const milestoneStore = useMilestoneStore()

const user = computed(() => authStore.user)
const profile = computed(() => profileStore.profile)
const hobbies = computed(() => profileStore.hobbies)
const loading = computed(() => profileStore.loading)

const isEditing = ref(false)
const showAddHobby = ref(false)
const showHobbyDetail = ref(false)

const editForm = ref({
  name: '',
  image: '',
})

const hobbyFilter = ref('active')
const allHobbies = computed(() => profileStore.hobbies)
const activeHobbies = computed(() => profileStore.activeHobbies)
const inactiveHobbies = computed(() =>
  allHobbies.value.filter((h) => !activeHobbies.value.includes(h)),
)
const filteredHobbies = computed(() => {
  if (hobbyFilter.value === 'active') return activeHobbies.value
  if (hobbyFilter.value === 'inactive') return inactiveHobbies.value
  return allHobbies.value
})

// Quiz History State
const quizHistory = ref<Array<{ id: string; hobby: string; matchedAt: string }>>([])
const quizHistoryLoading = ref(false)

const fetchQuizHistory = async () => {
  if (!user.value) return
  quizHistoryLoading.value = true
  try {
    const result = await ApiService.callConceptAction<any>(
      'QuizMatchmaker',
      '_getAllHobbyMatches',
      { user: user.value.id },
    )
    if (Array.isArray(result)) {
      quizHistory.value = result.map((m: any) => ({
        id: m.id || m._id || m.matchedAt,
        hobby: m.hobby,
        matchedAt: m.matchedAt,
      }))
    } else {
      quizHistory.value = []
    }
  } catch (err) {
    quizHistory.value = []
  } finally {
    quizHistoryLoading.value = false
  }
}

function formatDate(dateStr: string) {
  const d = new Date(dateStr)
  const date = d.toLocaleDateString(undefined, { year: 'numeric', month: 'short', day: 'numeric' })
  const time = d.toLocaleTimeString(undefined, { hour: '2-digit', minute: '2-digit' })
  return `${date} at ${time}`
}
const getInitials = (name: string) => {
  return name
    .split(' ')
    .map((word) => word.charAt(0))
    .join('')
    .toUpperCase()
    .slice(0, 2)
}

const toggleEditMode = async () => {
  if (isEditing.value) {
    try {
      // Save changes
      if (editForm.value.name !== profile.value?.name) {
        await profileStore.setName(editForm.value.name)
      }
      if (editForm.value.image !== profile.value?.image) {
        await profileStore.setImage(editForm.value.image)
      }
      isEditing.value = false
    } catch (error) {
      console.error('Failed to save profile changes:', error)
      alert('Failed to save profile changes. Please try again.')
    }
  } else {
    // Enter edit mode
    editForm.value = {
      name: profile.value?.name || '',
      image: profile.value?.image || '',
    }
    isEditing.value = true
  }
}

const addHobby = async (hobbyName: string) => {
  try {
    await profileStore.setHobby(hobbyName)
    if (user.value) {
      await profileStore.loadProfile(user.value.id)
    }
    showAddHobby.value = false
  } catch (err: any) {
    let msg = err?.message || 'Failed to add hobby.'
    if (msg.toLowerCase().includes('already') || msg.toLowerCase().includes('active')) {
      alert('You already have this hobby in your list.')
    } else {
      alert(msg)
    }
  }
}

const selectedHobby = ref<string | null>(null)
const selectedHobbyGoals = ref<any[] | null>(null)
const selectedHobbyIsActive = ref(false)

import { ApiService } from '@/services/api'

const clearQuizHistory = async () => {
  if (!user.value) return
  if (!confirm('Are you sure you want to clear your quiz history? This cannot be undone.')) return
  try {
    await ApiService.callConceptAction('QuizMatchmaker', '_deleteHobbyMatches', {
      user: user.value.id,
    })
    quizHistory.value = []
  } catch (err) {
    alert('Failed to clear quiz history.')
  }
}

const handleHobbyClick = async (hobby: string) => {
  selectedHobby.value = hobby
  showHobbyDetail.value = true
  selectedHobbyIsActive.value = activeHobbies.value.includes(hobby)
  selectedHobbyGoals.value = null // null means loading
  if (!user.value) return
  try {
    // Fetch all goals for this user and hobby from backend (backend filters by hobby)
    const result = await ApiService.callConceptAction('MilestoneTracker', '_getAllGoals', {
      user: user.value.id,
      hobby,
    })
    if (Array.isArray(result)) {
      // For each goal, fetch its steps and attach as 'steps' property
      const goalsWithSteps = await Promise.all(
        result.map(async (goal) => {
          try {
            const steps = await ApiService.callConceptAction('MilestoneTracker', '_getSteps', {
              goal: goal.id,
            })
            return { ...goal, steps: Array.isArray(steps) ? steps : [] }
          } catch (e) {
            return { ...goal, steps: [] }
          }
        }),
      )
      selectedHobbyGoals.value = goalsWithSteps
    } else {
      selectedHobbyGoals.value = []
    }
  } catch (err) {
    console.error('Failed to fetch all goals:', err)
    selectedHobbyGoals.value = []
  }
}

onMounted(async () => {
  if (user.value) {
    await profileStore.loadProfile(user.value.id)
    await fetchQuizHistory()
  }
})
</script>

<style scoped>

.base-btn {
  color: white;
  border: none;
  padding: 0.5rem 1rem;
  border-radius: 6px;
  cursor: pointer;
  font-weight: 500;
}
.hobby-card-wrapper {
  display: flex;
  flex-direction: column;
  align-items: stretch;
  gap: 0.5rem;
}
.view-step-history-link {
  align-self: flex-end;
  color: #388e3c;
  font-size: 0.98rem;
  text-decoration: none;
  font-weight: 500;
  margin-top: 0.2rem;
  margin-bottom: 0.5rem;
  transition: text-decoration 0.15s;
}
.view-step-history-link:hover {
  text-decoration: underline;
}
.quiz-sort-control {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  margin-left: auto;
}
.quiz-sort-control label {
  font-weight: 500;
  color: #333;
}
.quiz-sort-control select {
  padding: 0.3rem 0.7rem;
  border: 1px solid #ddd;
  border-radius: 6px;
  font-size: 1rem;
  cursor: pointer;
}
.clear-history-btn {
  background: linear-gradient(135deg, #ff8a65 0%, #d84315 100%);
  color: #fff;
  border: none;
  padding: 0.5rem 1rem;
  border-radius: 6px;
  cursor: pointer;
  font-weight: 500;
}

.profile-view {
  max-width: 1000px;
  margin: 0 auto;
}

.profile-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 2rem;
}

.profile-header h1 {
  margin: 0;
  color: #333;
}

.edit-button {
  background: linear-gradient(135deg, #81c784 0%, #388e3c 100%);
  color: white;
  border: none;
  padding: 0.5rem 1rem;
  border-radius: 6px;
  cursor: pointer;
  font-weight: 500;
}

.profile-content {
  display: flex;
  flex-direction: column;
  gap: 2rem;
}

.profile-card {
  background: white;
  border-radius: 12px;
  padding: 2rem;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
}

.profile-info {
  display: flex;
  gap: 1.5rem;
  align-items: flex-start;
}

.avatar {
  width: 100px;
  height: 100px;
  border-radius: 50%;
  overflow: hidden;
  flex-shrink: 0;
}

.avatar img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.avatar-placeholder {
  width: 100%;
  height: 100%;
  background: linear-gradient(135deg, #81c784 0%, #388e3c 100%);
  display: flex;
  align-items: center;
  justify-content: center;
  color: white;
  font-size: 2rem;
  font-weight: bold;
}

.user-details {
  flex: 1;
}

.view-mode h2 {
  margin: 0 0 0.5rem 0;
  color: #333;
}

.username {
  color: #666;
  margin: 0 0 0.5rem 0;
  font-size: 0.9rem;
}

.bio {
  color: #888;
  margin: 0;
  font-style: italic;
}

.edit-mode {
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.form-group {
  display: flex;
  flex-direction: column;
}

.form-group label {
  font-weight: 500;
  margin-bottom: 0.5rem;
  color: #333;
}

.form-group input {
  padding: 0.5rem;
  border: 1px solid #ddd;
  border-radius: 6px;
  font-size: 1rem;
}

.hobbies-section {
  background: white;
  border-radius: 12px;
  padding: 2rem;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
}

.section-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 1.5rem;
}

.section-header h3 {
  margin: 0;
  color: #333;
}

.add-button {
  background: linear-gradient(135deg, #81c784 0%, #388e3c 100%);
  color: white;
  border: none;
  padding: 0.5rem 1rem;
  border-radius: 6px;
  cursor: pointer;
  font-weight: 500;
}

.edit-button:hover,
.add-button:hover {
  background: linear-gradient(135deg, #81c784 0%, #388e3c 100%);
}

.loading-state,
.empty-state {
  text-align: center;
  padding: 2rem;
  color: #666;
}

.hobbies-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(200px, 1fr));
  gap: 1rem;
  max-height: 230px;
  overflow-y: auto;
}

.filter-dropdown {
  margin-bottom: 1.5rem;
}

.filter-dropdown label {
  font-weight: 500;
  margin-right: 1rem;
  color: #333;
}

.filter-dropdown select {
  padding: 0.5rem;
  border: 1px solid #ddd;
  border-radius: 6px;
  font-size: 1rem;
  cursor: pointer;
}

/* Match .add-button height and style */
.hobby-actions-row {
  display: flex;
  align-items: center;
  gap: 1rem;
  margin-left: auto;
}
.hobby-filter-label {
  font-weight: 500;
}
.hobby-filter {
  padding: 0.3rem 0.7rem;
  border-radius: 6px;
  border: 1px solid #ddd;
  font-size: 1rem;
  cursor: pointer;
  background: white;
  box-sizing: border-box;
  font-weight: 500;
}

/* Quiz History Section */
.quiz-history-section {
  background: white;
  border-radius: 12px;
  padding: 2rem;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
  margin-bottom: 2rem;
}
.quiz-history-grid {
  display: grid;
  background: linear-gradient(135deg, #ff8a65 0%, #d84315 100%);
  background: #f7fafc;
  border-radius: 8px;
  padding: 1.2rem 1rem;
  box-shadow: 0 1px 4px rgba(0, 0, 0, 0.04);
  display: flex;
  flex-direction: column;
  align-items: flex-start;
}
.quiz-history-hobby {
  font-size: 1.2rem;
  font-weight: 600;
  color: #388e3c;
  margin-bottom: 0.5rem;
}
.quiz-history-date {
  font-size: 0.95rem;
  color: #666;
}
@media (max-width: 768px) {
  .profile-info {
    flex-direction: column;
    text-align: center;
  }

  .profile-header {
    flex-direction: column;
    gap: 1rem;
    text-align: center;
  }

  .section-header {
    flex-direction: column;
    gap: 1rem;
  }
}
</style>
