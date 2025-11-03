<template>
  <div class="profile-view">
    <div class="profile-header">
      <h1>My Profile</h1>
      <div class="header-actions">
        <button @click="toggleEditMode" class="base-btn edit-button">
          {{ isEditing ? 'Save Changes' : 'Edit Profile' }}
        </button>
        <button @click="closeProfile" class="base-btn delete-button">Delete Profile</button>
      </div>
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
              v-if="goalsLoaded && hobbyHasGoals(hobby)"
              class="view-step-history-link"
              :to="{ name: 'hobby-step-history', params: { hobby } }"
            >
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

    <!-- Delete Confirmation Modal -->
    <div
      v-if="showDeleteConfirmation"
      class="modal-overlay"
      @click="showDeleteConfirmation = false"
    >
      <div class="modal-content delete-modal" @click.stop>
        <div class="modal-header">
          <h2>Delete Profile</h2>
          <button @click="showDeleteConfirmation = false" class="close-button">×</button>
        </div>
        <div class="modal-body">
          <div class="warning-icon">⚠️</div>
          <p class="warning-text">
            Are you sure you want to delete your profile? This action will permanently delete:
          </p>
          <ul class="delete-items-list">
            <li>All your hobbies</li>
            <li>All your goals and steps</li>
            <li>Your quiz history</li>
            <li>Your profile information</li>
          </ul>
          <p class="warning-text-bold">This action cannot be undone.</p>
        </div>
        <div class="modal-footer">
          <button @click="showDeleteConfirmation = false" class="cancel-button">Cancel</button>
          <button @click="confirmcloseProfile" class="confirm-delete-button">Delete Profile</button>
        </div>
      </div>
    </div>

    <!-- Deleting Overlay -->
    <div v-if="isDeleting" class="deleting-overlay">
      <div class="deleting-content">
        <div class="spinner"></div>
        <p>Deleting your account...</p>
      </div>
    </div>
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
    await profileStore.loadProfile()
  }
  showHobbyDetail.value = false
}

const markHobbyActive = async (hobbyName: string) => {
  await profileStore.setHobby(hobbyName)
  if (user.value) {
    await profileStore.loadProfile()
  }
  showHobbyDetail.value = false
}

const closeProfile = async () => {
  showDeleteConfirmation.value = true
}

const confirmcloseProfile = async () => {
  const userId = user.value?.id || authStore.user?.id

  if (!userId) {
    alert('Unable to delete profile: User not found. Please try logging out and back in.')
    showDeleteConfirmation.value = false
    return
  }

  isDeleting.value = true

  try {
    // Delete the profile first
    const profileResult = await ApiService.callConceptAction('UserProfile', 'closeProfile', {
      user: userId,
    })

    if (profileResult && typeof profileResult === 'object' && 'error' in profileResult) {
      throw new Error(profileResult.error as string)
    }

    try {
      const userResult = await ApiService.callConceptAction(
        'PasswordAuthentication',
        'deleteUser',
        {
          user: userId,
        },
      )

      if (userResult && typeof userResult === 'object' && 'error' in userResult) {
        throw new Error(userResult.error as string)
      }
    } catch (userDeleteError) {
      // If deleteUser endpoint doesn't exist (404) or fails, continue with logout
    }

    showDeleteConfirmation.value = false

    authStore.logout()
    milestoneStore.clearMilestones()

    setTimeout(() => {
      window.location.replace('/')
    }, 100)
  } catch (err) {
    isDeleting.value = false
    const errorMsg =
      err instanceof Error ? err.message : 'Failed to delete profile. Please try again.'
    alert(errorMsg)
    showDeleteConfirmation.value = false
  }
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
const loading = computed(() => profileStore.loading)
const goalsLoaded = computed(() => !milestoneStore.loading)

const isEditing = ref(false)
const showAddHobby = ref(false)
const showHobbyDetail = ref(false)
const showDeleteConfirmation = ref(false)
const isDeleting = ref(false)

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
      {},
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
      await profileStore.loadProfile()
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
    await ApiService.callConceptAction('QuizMatchmaker', 'deleteHobbyMatches', {})
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
    await profileStore.loadProfile()
    // Ensure user's goals are loaded so hobbyHasGoals can return accurate results
    await milestoneStore.loadUserGoals()
    await fetchQuizHistory()
  }
})
</script>

<style scoped>
@import url('https://fonts.googleapis.com/css2?family=Poppins:wght@300;400;500;600;700&display=swap');

.base-btn {
  color: white;
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
  color: #256b28;
  font-family: 'Poppins', sans-serif;
}
.quiz-sort-control select,
.hobby-filter-label select {
  padding: 0.3rem 0.7rem;
  border: 1px solid #bce7bd;
  border-radius: 6px;
  font-size: 1rem;
  cursor: pointer;
  font-family: 'Poppins', sans-serif;
  background: #fff;
}
.clear-history-btn {
  background: #388e3c;
  color: #fff;
  padding: 0.5rem 1rem;
  border-radius: 6px;
  cursor: pointer;
  font-weight: 500;
}

.profile-view {
  max-width: 1000px;
  margin: 0 auto;
  font-family: 'Poppins', sans-serif;
}

.profile-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 2rem;
}

.profile-header h1 {
  margin: 0;
  font-weight: 500;
  color: #256b28;
  font-family: 'Poppins', sans-serif;
}

.header-actions {
  display: flex;
  gap: 1rem;
  align-items: center;
}

.edit-button {
  background: #388e3c;
  color: white;
  padding: 0.5rem 1rem;
  border-radius: 6px;
  cursor: pointer;
  font-weight: 500;
  font-family: 'Poppins', sans-serif;
  border: none;
  transition: background 0.2s;
}

.edit-button:hover {
  background: #2e7d32;
}

.delete-button {
  background: #d32f2f;
  color: white;
  padding: 0.5rem 1rem;
  border-radius: 6px;
  cursor: pointer;
  font-weight: 500;
  font-family: 'Poppins', sans-serif;
  border: none;
  transition: background 0.2s;
}

.delete-button:hover {
  background: #b71c1c;
}

.profile-content {
  display: flex;
  flex-direction: column;
  gap: 2rem;
}

.profile-card {
  background: #e8f5e9;
  border-radius: 12px;
  padding: 2rem;
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
  background: #e8f5e9;
}

.avatar img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.avatar-placeholder {
  width: 100%;
  height: 100%;
  background: #388e3c;
  display: flex;
  align-items: center;
  justify-content: center;
  color: white;
  font-size: 2rem;
  font-family: 'Poppins', sans-serif;
}

.user-details {
  flex: 1;
}

.view-mode h2 {
  margin: 0 0 0.5rem 0;
  color: #256b28;
  font-family: 'Poppins', sans-serif;
}

.username {
  color: #666;
  margin: 0 0 0.5rem 0;
  font-size: 0.9rem;
  font-family: 'Poppins', sans-serif;
}

.bio {
  color: #888;
  margin: 0;
  font-style: italic;
  font-family: 'Poppins', sans-serif;
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
  color: #256b28;
  border: none;
  font-family: 'Poppins', sans-serif;
}

.form-group input {
  padding: 0.5rem;
  border-radius: 6px;
  font-size: 1rem;
  border: none;
  font-family: 'Poppins', sans-serif;
}

.hobbies-section {
  background: #e8f5e9;
  border-radius: 12px;
  padding: 2rem;
}

.section-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 1.5rem;
}

.section-header h3 {
  margin: 0;
  font-weight: 500;
  color: #256b28;
  font-family: 'Poppins', sans-serif;
}

.add-button,
.clear-history-btn,
.edit-button {
  background: #388e3c;
  color: white;
  border: none;
  padding: 0.5rem 1rem;
  border-radius: 6px;
  cursor: pointer;
  font-weight: 500;
  font-family: 'Poppins', sans-serif;
}

.edit-button:hover,
.add-button:hover,
.clear-history-btn:hover {
  background: #256b28;
}

.loading-state,
.empty-state {
  text-align: center;
  padding: 2rem;
  color: #666;
  font-family: 'Poppins', sans-serif;
}

.hobbies-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(200px, 1fr));
  gap: 1rem;
  max-height: 230px;
  overflow-y: auto;
}

.hobby-actions-row {
  display: flex;
  align-items: center;
  gap: 1rem;
  margin-left: auto;
}
.hobby-filter-label {
  font-weight: 500;
  color: #256b28;
  font-family: 'Poppins', sans-serif;
  margin-right: 0.5rem;
}
.hobby-filter {
  padding: 0.3rem 0.7rem;
  border-radius: 6px;
  border: 1px solid #bce7bd;
  font-size: 1rem;
  cursor: pointer;
  background: #fff;
  font-family: 'Poppins', sans-serif;
  margin-right: 1rem;
}
.quiz-history-section {
  background: #e8f5e9;
  border-radius: 12px;
  padding: 2rem;
  margin-bottom: 2rem;
}
.quiz-history-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(220px, 1fr));
  gap: 1rem;
  background: #e8f5e9;
  border-radius: 8px;
  padding: 1.2rem 1rem;
}
.quiz-history-card {
  background: #b2e3b5;
  border-radius: 8px;
  padding: 1rem 1.5rem;
  margin-bottom: 1rem;
  min-width: 220px;
  max-width: 100%;
  display: flex;
  flex-direction: column;
  align-items: flex-start;
}
.quiz-history-hobby {
  font-size: 1.2rem;
  font-weight: 600;
  color: #388e3c;
  margin-bottom: 0.5rem;
  font-family: 'Poppins', sans-serif;
}
.quiz-history-date {
  font-size: 0.95rem;
  color: #666;
  font-family: 'Poppins', sans-serif;
}
.hobby-sort-control {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  margin-right: 1rem;
}
.hobby-sort-control label {
  font-weight: 500;
  color: #256b28;
  font-family: 'Poppins', sans-serif;
}
.hobby-sort-control select {
  padding: 0.3rem 0.7rem;
  border: 1px solid #bce7bd;
  border-radius: 6px;
  font-size: 1rem;
  cursor: pointer;
  font-family: 'Poppins', sans-serif;
  background: #fff;
}

/* Delete Confirmation Modal Styles */
.modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.5);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
  padding: 1rem;
}

.modal-content {
  background: #fff;
  border-radius: 16px;
  width: 100%;
  max-width: 500px;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.15);
}

.delete-modal .modal-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 1.5rem 1.5rem 1rem 1.5rem;
  border-bottom: 1px solid #e0e0e0;
}

.delete-modal .modal-header h2 {
  margin: 0;
  color: #d32f2f;
  font-size: 1.5rem;
  font-weight: 600;
  font-family: 'Poppins', sans-serif;
}

.close-button {
  background: none;
  border: none;
  font-size: 2rem;
  color: #666;
  cursor: pointer;
  width: 40px;
  height: 40px;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 50%;
  transition: background 0.2s;
  padding: 0;
  line-height: 1;
}

.close-button:hover {
  background: #f5f5f5;
}

.modal-body {
  padding: 1.5rem;
  text-align: center;
}

.warning-icon {
  font-size: 3rem;
  margin-bottom: 1rem;
}

.warning-text {
  color: #333;
  font-size: 1rem;
  margin-bottom: 1rem;
  font-family: 'Poppins', sans-serif;
  text-align: left;
}

.warning-text-bold {
  color: #d32f2f;
  font-size: 1.1rem;
  font-weight: 600;
  margin-top: 1.5rem;
  font-family: 'Poppins', sans-serif;
}

.delete-items-list {
  text-align: left;
  margin: 1rem 0;
  padding-left: 1.5rem;
  color: #666;
  font-family: 'Poppins', sans-serif;
}

.delete-items-list li {
  margin-bottom: 0.5rem;
}

.modal-footer {
  display: flex;
  justify-content: flex-end;
  gap: 1rem;
  padding: 1rem 1.5rem 1.5rem 1.5rem;
  border-top: 1px solid #e0e0e0;
}

.cancel-button {
  background: #f5f5f5;
  color: #333;
  border: 1px solid #e0e0e0;
  padding: 0.75rem 1.5rem;
  border-radius: 8px;
  cursor: pointer;
  font-weight: 500;
  font-family: 'Poppins', sans-serif;
  transition: background 0.2s;
}

.cancel-button:hover {
  background: #e0e0e0;
}

.confirm-delete-button {
  background: #d32f2f;
  color: white;
  border: none;
  padding: 0.75rem 1.5rem;
  border-radius: 8px;
  cursor: pointer;
  font-weight: 500;
  font-family: 'Poppins', sans-serif;
  transition: background 0.2s;
}

.confirm-delete-button:hover {
  background: #b71c1c;
}

/* Deleting Overlay */
.deleting-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.8);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 2000;
}

.deleting-content {
  text-align: center;
  color: white;
}

.deleting-content p {
  margin-top: 1rem;
  font-size: 1.2rem;
  font-weight: 500;
}

.spinner {
  border: 4px solid rgba(255, 255, 255, 0.3);
  border-top: 4px solid white;
  border-radius: 50%;
  width: 50px;
  height: 50px;
  animation: spin 1s linear infinite;
  margin: 0 auto;
}

@keyframes spin {
  0% {
    transform: rotate(0deg);
  }
  100% {
    transform: rotate(360deg);
  }
}
</style>
