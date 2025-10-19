<template>
  <div class="dashboard">
    <DashboardHeader />
    <DashboardNavigation />

    <div class="main-content">
      <router-view />
    </div>
  </div>
</template>

<script setup lang="ts">
3
import DashboardHeader from '@/components/dashboard/DashboardHeader.vue'
import DashboardNavigation from '@/components/dashboard/DashboardNavigation.vue'
</script>

<style scoped>
.dashboard {
  min-height: 100vh;
  background-color: #f8f9fa;
}

.main-content {
  padding: 2rem;
  width: 100%;
}

@media (max-width: 768px) {
  .main-content {
    padding: 1rem;
  }
}
</style>
