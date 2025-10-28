<template>
  <div class="hobby-card" @click="$emit('click', hobby)">
    <span class="hobby-name">{{ hobby }}</span>
  </div>
</template>

<script setup lang="ts">
defineProps<{ hobby: string }>()
</script>

<style scoped>
.hobby-card {
  background: #b2e3b5;
  border-radius: 12px;
  padding: 1.5rem 2rem;
  margin: 0.5rem 0;
  display: flex;
  align-items: center;
  transition: box-shadow 0.2s;
}
.hobby-card:hover {
  background: #81c784;
}
.hobby-name {
  font-size: 1.2rem;
  color: #388e3c;
  font-weight: 600;
  letter-spacing: 0.5px;
}
</style>
