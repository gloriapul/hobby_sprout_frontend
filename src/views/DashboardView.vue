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
  background: linear-gradient(120deg, #c4dfaa 0%, #86c3c4 100%);
}

.main-content {
  padding: 2.5rem 2rem;
  width: 100%;
  background: rgba(255, 255, 255, 0.8);
  border-radius: 2rem;
  box-shadow: 0 8px 32px rgba(53, 122, 95, 0.1);
  margin-top: 2rem;
}

@media (max-width: 768px) {
  .main-content {
    padding: 1rem;
  }
}
</style>
