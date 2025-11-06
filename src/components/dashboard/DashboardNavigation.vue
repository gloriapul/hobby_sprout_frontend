<template>
  <nav class="dashboard-navigation">
    <div class="nav-container">
      <div class="nav-section">
        <router-link to="/dashboard" class="nav-item" exact-active-class="active">
          <svg class="nav-icon" viewBox="0 0 20 20" fill="currentColor">
            <path
              d="M10.707 2.293a1 1 0 00-1.414 0l-7 7a1 1 0 001.414 1.414L4 10.414V17a1 1 0 001 1h2a1 1 0 001-1v-2a1 1 0 011-1h2a1 1 0 011 1v2a1 1 0 001 1h2a1 1 0 001-1v-6.586l.293.293a1 1 0 001.414-1.414l-7-7z"
            />
          </svg>
          <span>Overview</span>
        </router-link>

        <div class="nav-section">
          <router-link to="/dashboard/milestones" class="nav-item" active-class="active">
            <svg class="nav-icon" viewBox="0 0 20 20" fill="currentColor">
              <path
                fill-rule="evenodd"
                d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                clip-rule="evenodd"
              />
            </svg>
            <span>My Journey</span>
          </router-link>
        </div>

        <div class="nav-section">
          <router-link to="/dashboard/quiz" class="nav-item" active-class="active">
            <svg class="nav-icon" viewBox="0 0 20 20" fill="currentColor">
              <path
                fill-rule="evenodd"
                d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-8-3a1 1 0 00-.867.5 1 1 0 11-1.731-1A3 3 0 0113 8a3.001 3.001 0 01-2 2.83V11a1 1 0 11-2 0v-1a1 1 0 011-1 1 1 0 100-2zm0 8a1 1 0 100-2 1 1 0 000 2z"
                clip-rule="evenodd"
              />
            </svg>
            <span>Quiz</span>
          </router-link>
        </div>
        <router-link to="/dashboard/profile" class="nav-item" active-class="active">
          <svg class="nav-icon" viewBox="0 0 20 20" fill="currentColor">
            <path
              fill-rule="evenodd"
              d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z"
              clip-rule="evenodd"
            />
          </svg>
          <span>Profile</span>
        </router-link>
      </div>
    </div>
  </nav>
</template>

<script setup lang="ts"></script>

<style scoped>
.dashboard-navigation {
  background: #e8f5e9;
  position: sticky;
  top: 0;
  z-index: 100;
}

.nav-container {
  width: 100%;
  padding: 0 2rem;
  display: flex;
  align-items: center;
  gap: 2rem;
  overflow-x: auto;
}

.nav-section {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  flex-shrink: 0;
}

.nav-item {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  padding: 1rem 1.25rem;
  text-decoration: none;
  color: #256b28;
  font-weight: 500;
  border-radius: 8px;
  transition: all 0.2s;
  white-space: nowrap;
}

.nav-item:hover {
  background: #bce7bd;
  color: #388e3c;
}

.nav-icon {
  width: 18px;
  height: 18px;
  flex-shrink: 0;
  color: #388e3c;
}

.nav-item span {
  font-size: 0.9rem;
}
</style>
