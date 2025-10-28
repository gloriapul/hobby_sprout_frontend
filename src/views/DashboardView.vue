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

.main-content {
  padding: 2.5rem 2rem;
  width: 100%;
  background: #fff;
}
</style>
