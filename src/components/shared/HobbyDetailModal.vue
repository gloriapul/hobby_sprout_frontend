<template>
  <div class="modal-overlay" @click.self="emit('close')">
    <div class="modal-content">
      <div class="modal-header">
        <h2>{{ hobby }}</h2>
        <button @click="emit('close')" class="close-btn">×</button>
      </div>
      <div class="modal-body">
        <div class="goals-section">
          <h3>Goals for this Hobby</h3>
          <ul v-if="goals.length">
            <li v-for="goal in goals" :key="goal.id">
              <span>{{ goal.description }}</span>
              <span v-if="goal.completed" class="goal-status completed">(Completed)</span>
              <span v-else class="goal-status">(In Progress)</span>
            </li>
          </ul>
          <div v-else>No goals found for this hobby.</div>
        </div>
        <div class="actions">
          <button v-if="isActive" @click="markInactive" class="inactive-btn">
            Mark as Inactive
          </button>
          <button v-else @click="markActive" class="active-btn">Mark as Active</button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, watch, onMounted } from 'vue'
const emit = defineEmits(['close', 'markInactive', 'markActive'])
const props = defineProps<{ hobby: string; isActive: boolean; goals: any[] }>()

const markInactive = () => emit('markInactive', props.hobby)
const markActive = () => emit('markActive', props.hobby)
</script>

<style scoped>
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
}
.modal-content {
  background: #fff;
  border-radius: 16px;
  max-width: 400px;
  width: 100%;
  padding: 2rem;
  box-shadow: 0 4px 24px rgba(0, 0, 0, 0.15);
}
.modal-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 1rem;
}
.close-btn {
  background: none;
  border: none;
  font-size: 1.5rem;
  cursor: pointer;
}
.goals-section {
  margin-bottom: 1.5rem;
}
.goal-status {
  margin-left: 0.5rem;
  font-size: 0.95em;
  color: #888;
}
.goal-status.completed {
  color: #388e3c;
}
.actions {
  display: flex;
  gap: 1rem;
  justify-content: flex-end;
}
.inactive-btn {
  background: #fff3e0;
  color: #e65100;
  border: 1px solid #e65100;
  border-radius: 8px;
  padding: 0.5rem 1rem;
  cursor: pointer;
}
.active-btn {
  background: #e8f5e9;
  color: #388e3c;
  border: 1px solid #388e3c;
  border-radius: 8px;
  padding: 0.5rem 1rem;
  cursor: pointer;
}
</style>
