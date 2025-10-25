<script setup lang="ts">
import type { CSSProperties } from 'vue'
import { ref, computed, onMounted, onUnmounted } from 'vue'
import { Teleport } from 'vue'
import { useRouter } from 'vue-router'
import { useAuthStore } from '@/stores/auth'
import { useProfileStore } from '@/stores/profile'

const router = useRouter()
const authStore = useAuthStore()
const profileStore = useProfileStore()

const user = computed(() => authStore.user)
const displayName = computed(() => {
  // Use profile name if available, otherwise fall back to username
  return profileStore.profile?.name || user.value?.username || 'User'
})
const showUserMenu = ref(false)
const userButtonRef = ref<HTMLElement>()

const dropdownStyle = ref<CSSProperties>({
  position: 'fixed',
  top: '80px',
  right: '2rem',
  zIndex: '1000',
})

const getUserInitials = () => {
  const name = displayName.value
  if (!name || name === 'User') return 'U'
  return name
    .split(' ')
    .map((word) => word.charAt(0))
    .join('')
    .toUpperCase()
}

const toggleUserMenu = () => {
  showUserMenu.value = !showUserMenu.value
  if (showUserMenu.value && userButtonRef.value) {
    const rect = userButtonRef.value.getBoundingClientRect()
    dropdownStyle.value = {
      position: 'fixed',
      top: `${rect.bottom + 8}px`,
      right: '2rem',
      zIndex: '1000',
    }
  }
}

const handleLogout = () => {
  authStore.logout()
  router.push('/login')
}

// Close menu when clicking outside
const handleClickOutside = (e: Event) => {
  if (
    showUserMenu.value &&
    userButtonRef.value &&
    !(e.target as Element).closest('.user-menu') &&
    !userButtonRef.value.contains(e.target as Node)
  ) {
    showUserMenu.value = false
  }
}

onMounted(() => {
  document.addEventListener('click', handleClickOutside)

  // Load profile if user is authenticated
  if (user.value?.id) {
    profileStore.loadProfile(user.value.id)
  }
})

onUnmounted(() => {
  document.removeEventListener('click', handleClickOutside)
})
</script>

<template>
  <header class="dashboard-header">
    <div class="header-content">
      <div class="logo-section">
        <img src="/HobbySproutLogo.png" alt="HobbySprout" class="logo" />
        <h1>HobbySprout</h1>
      </div>

      <div class="header-actions">
        <div class="user-menu">
          <button ref="userButtonRef" @click="toggleUserMenu" class="user-button">
            <div class="user-avatar">
              <img
                v-if="profileStore.profile?.image"
                :src="profileStore.profile.image"
                :alt="displayName"
                style="width: 100%; height: 100%; object-fit: cover; border-radius: 50%"
              />
              <span v-else>{{ getUserInitials() }}</span>
            </div>
            <span>{{ displayName }}</span>
            <svg
              class="chevron"
              :class="{ open: showUserMenu }"
              viewBox="0 0 20 20"
              fill="currentColor"
            >
              <path
                fill-rule="evenodd"
                d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z"
                clip-rule="evenodd"
              />
            </svg>
          </button>

          <Teleport to="body">
            <div v-if="showUserMenu" class="user-dropdown" :style="dropdownStyle as CSSProperties">
              <button class="logout-btn" @click="handleLogout">
                <svg class="logout-icon" viewBox="0 0 20 20" fill="currentColor">
                  <path
                    fill-rule="evenodd"
                    d="M7 4a1 1 0 011-1h4a1 1 0 011 1v3a1 1 0 102 0V4a3 3 0 00-3-3H8a3 3 0 00-3 3v12a3 3 0 003 3h4a3 3 0 003-3v-3a1 1 0 10-2 0v3a1 1 0 01-1 1H8a1 1 0 01-1-1V4z"
                    clip-rule="evenodd"
                  />
                  <path
                    fill-rule="evenodd"
                    d="M12.293 9.293a1 1 0 011.414 0l2 2a1 1 0 010 1.414l-2 2a1 1 0 01-1.414-1.414L13.586 13H7a1 1 0 110-2h6.586l-1.293-1.293a1 1 0 010-1.414z"
                    clip-rule="evenodd"
                  />
                </svg>
                <span>Logout</span>
              </button>
            </div>
          </Teleport>
        </div>
      </div>
    </div>
  </header>
</template>

<style scoped>
.dashboard-header {
  background: white;
  border-bottom: 1px solid #e9ecef;
  height: 80px;
  position: sticky;
  top: 0;
  z-index: 100;
  overflow: visible;
}

.header-content {
  width: 100%;
  height: 100%;
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 0 2rem;
  overflow: visible;
}

.logo-section {
  display: flex;
  align-items: center;
  gap: 0.75rem;
}

.logo {
  width: 40px;
  height: 40px;
  border-radius: 8px;
}

.logo-section h1 {
  margin: 0;
  color: #333;
  font-size: 1.5rem;
  font-weight: 600;
}

.header-actions {
  display: flex;
  align-items: center;
  gap: 1rem;
}

.user-menu {
  position: relative;
  overflow: visible;
}

.user-button {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  background: white;
  border: 1px solid #e9ecef;
  border-radius: 8px;
  padding: 0.5rem 0.75rem;
  cursor: pointer;
  transition: all 0.2s;

  /* removed invalid background and border-color */

  .user-avatar {
    width: 32px;
    height: 32px;
    border-radius: 50%;
    background: linear-gradient(135deg, #81c784 0%, #388e3c 100%);
    display: flex;
    align-items: center;
    justify-content: center;
    color: white;
    font-size: 0.85rem;
    font-weight: 600;
  }

  .user-button span {
    color: #333;
    font-weight: 500;
  }

  .chevron {
    width: 16px;
    height: 16px;
    color: #666;
    transition: transform 0.2s;
  }

  .chevron.open {
    transform: rotate(180deg);
  }

  .user-dropdown {
    position: fixed;
    top: 80px;
    right: 2rem;
    background: white;
    border: 1px solid #e9ecef;
    border-radius: 8px;
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
    min-width: 160px;
    z-index: 1000;
    overflow: visible;
  }

  .user-dropdown a,
  .user-dropdown button {
    display: block;
    width: 100%;
    padding: 0.75rem 1rem;
    border: none;
    background: none;
    text-align: left;
    text-decoration: none;
    color: #333;
    cursor: pointer;
    transition: background-color 0.2s;
  }

  .logout-btn {
    display: flex;
    align-items: center;
    gap: 0.5rem;
    background: #fff;
    color: #e53935;
    font-weight: 600;
    border-radius: 0 0 8px 8px;
    border-top: 1px solid #e9ecef;
    box-shadow: none;
    transition:
      background 0.2s,
      color 0.2s;
    padding: 0.7rem 1.2rem;
    font-size: 1rem;
    min-width: 120px;
    justify-content: flex-start;
    border: none;
    outline: none;
    cursor: pointer;
  }
  .logout-btn:hover {
    background: #ffeaea;
    color: #b71c1c;
  }
  .logout-btn:active {
    background: #ffd6d6;
    color: #b71c1c;
  }
  .logout-icon {
    width: 20px;
    height: 20px;
    margin-right: 0.25rem;
    color: #e53935;
    flex-shrink: 0;
  }

  /* removed invalid background */
}

.user-dropdown a:first-child {
  border-radius: 8px 8px 0 0;
}

.user-dropdown button:last-child {
  border-radius: 0 0 8px 8px;
  border-top: 1px solid #e9ecef;
  color: #dc3545;
}

@media (max-width: 768px) {
  .header-content {
    padding: 0 1rem;
  }

  .logo-section h1 {
    display: none;
  }

  .user-button span {
    display: none;
  }
}
</style>
