<template>
  <div class="profile-view">
    <!-- Debug Component - Remove this after testing -->
    <ProfileDebugTest />

    <div class="profile-header">
      <h1>My Profile</h1>
      <button @click="toggleEditMode" class="edit-button">
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
          <button @click="showAddHobby = true" class="add-button">+ Add Hobby</button>
        </div>

        <div v-if="loading" class="loading-state">Loading hobbies...</div>

        <div v-else-if="hobbies.length === 0" class="empty-state">
          <p>No hobbies added yet. Add your first hobby to get started!</p>
        </div>

        <div v-else class="hobbies-grid">
          <div v-for="hobby in hobbies" :key="hobby" class="hobby-toggle-row">
            <HobbyCard :hobby="hobby" />
            <label class="toggle-switch">
              <input
                type="checkbox"
                :checked="isHobbyActive(hobby)"
                @change="toggleHobbyActive(hobby)"
              />
              <span class="slider"></span>
              <span class="toggle-label">{{ isHobbyActive(hobby) ? 'Active' : 'Inactive' }}</span>
            </label>
          </div>
        </div>
      </div>
    </div>

    <!-- Add Hobby Modal -->
    <HobbyModal v-if="showAddHobby" @close="showAddHobby = false" @add="addHobby" />
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { useAuthStore } from '@/stores/auth'
import { useProfileStore } from '@/stores/profile'
import HobbyModal from '../components/modals/HobbyModal.vue'
import HobbyCard from '@/components/shared/HobbyCard.vue'

const authStore = useAuthStore()
const profileStore = useProfileStore()

const user = computed(() => authStore.user)
const profile = computed(() => profileStore.profile)
const hobbies = computed(() => profileStore.hobbies)
const loading = computed(() => profileStore.loading)
const activeHobbies = computed(() => profileStore.activeHobbies)

const isEditing = ref(false)
const showAddHobby = ref(false)

const editForm = ref({
  name: '',
  image: '',
})

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
  await profileStore.setHobby(hobbyName)
  showAddHobby.value = false
}

const removeHobby = async (hobbyName: string) => {
  await profileStore.closeHobby(hobbyName)
}

onMounted(async () => {
  if (user.value) {
    await profileStore.loadProfile(user.value.id)
  }
})

function isHobbyActive(hobby: string) {
  if (activeHobbies.value.length) {
    return activeHobbies.value.includes(hobby)
  }
  return true
}

async function toggleHobbyActive(hobby: string) {
  if (isHobbyActive(hobby)) {
    await profileStore.setHobbyInactive(hobby)
  } else {
    await profileStore.setHobbyActive(hobby)
  }
}
</script>

<style scoped>
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
