<template>
  <div class="hobby-card">
    <span class="hobby-name">{{ hobby }}</span>
  </div>
</template>

<script setup lang="ts">
defineProps<{ hobby: string }>()
</script>

<style scoped>
.hobby-card {
  background: linear-gradient(135deg, #e8f5e9 0%, #c8e6c9 100%);
  border: 2px solid #81c784;
  border-radius: 16px;
  padding: 1.5rem 2rem;
  margin: 0.5rem 0;
  box-shadow: 0 2px 8px rgba(56, 142, 60, 0.08);
  display: flex;
  align-items: center;
  transition: box-shadow 0.2s;
}
.hobby-card:hover {
  box-shadow: 0 4px 16px rgba(56, 142, 60, 0.15);
}
.hobby-name {
  font-size: 1.2rem;
  color: #388e3c;
  font-weight: 600;
  letter-spacing: 0.5px;
}
</style>