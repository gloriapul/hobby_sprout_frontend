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
          <div v-if="props.loading" class="goals-spinner-wrap">
            <span class="spinner"></span>
          </div>
          <div v-else>
            <p class="goal-count">
              <strong>{{ Array.isArray(goals) ? goals.length : 0 }}</strong>
              {{ goals && goals.length === 1 ? 'goal exists' : 'goals exist' }} for this hobby.
            </p>
          </div>
        </div>
        <div class="actions">
          <button
            v-if="Array.isArray(goals) && goals.length > 0"
            class="view-step-history-link"
            @click="goToStepHistory"
            type="button"
          >
            View Goal & Step History
          </button>
          <button v-if="isActive" @click="markInactive" class="inactive-btn">
            Mark as Inactive
          </button>
          <button v-else class="active-btn" @click="markActive">Mark as Active</button>
        </div>
        <div v-if="showInactiveError" class="inactive-error">
          Cannot mark as inactive while there are active goals.
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, watch } from 'vue'
import { useRouter } from 'vue-router'
const router = useRouter()

function goToStepHistory() {
  router.push({ name: 'hobby-step-history', params: { hobby: props.hobby } })
}

const emit = defineEmits(['close', 'markInactive', 'markActive'])
const props = defineProps<{
  hobby: string
  isActive: boolean
  goals: any[] | null
  loading?: boolean
}>()

const showInactiveError = ref(false)

const markInactive = () => {
  if (Array.isArray(props.goals) && props.goals.some((g) => g.isActive)) {
    showInactiveError.value = true
    return
  }
  emit('markInactive', props.hobby)
}
const markActive = () => emit('markActive', props.hobby)

// Reset error when modal closes or state changes
watch(
  () => [props.hobby, props.isActive, props.goals],
  () => {
    showInactiveError.value = false
  },
)
</script>

<style scoped>
.inactive-error {
  color: #c62828;
  margin-top: 0.5rem;
  font-size: 1rem;
  text-align: right;
}
.close-error-btn {
  background: none;
  border: none;
  color: #c62828;
  font-size: 1.2rem;
  margin-left: 0.5rem;
  cursor: pointer;
}
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
  width: 400px;
  min-width: 400px;
  max-width: 400px;
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
  min-height: 80px;
  width: 100%;
}
.goals-section ul {
  width: 100%;
  min-width: 0;
  padding-left: 1.2em;
  box-sizing: border-box;
}
.goals-section > div {
  width: 100%;
  text-align: left;
  padding-left: 0;
  box-sizing: border-box;
}

.actions {
  display: flex;
  gap: 1rem;
  justify-content: flex-end;
  min-height: 42px;
  min-width: 220px;
  position: relative;
  font-weight: 500;
}

.inactive-btn {
  background: #fff3e0;
  color: #e65100;
  border: none;
  border-radius: 8px;
  padding: 0.5rem 1rem;
  cursor: pointer;
  font-size: 1rem;
  font-weight: 500;
  min-width: 120px;
  min-height: 42px;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  transition:
    background 0.2s,
    color 0.2s,
    border 0.2s;
}
.inactive-btn:hover {
  background: #ffe0b2;
  color: #a84300;
}

.active-btn {
  background: #e8f5e9;
  color: #388e3c;
  border: none;
  border-radius: 8px;
  padding: 0.5rem 1rem;
  cursor: pointer;
  font-size: 1rem;
  font-weight: 500;
  min-width: 120px;
  min-height: 42px;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  transition:
    background 0.2s,
    color 0.2s,
    border 0.2s;
}

.active-btn:hover {
  background: #c8e6c9;
  color: #256029;
}

.view-step-history-link {
  background: #d1f3ff;
  color: #38778e;
  border: none;
  border-radius: 8px;
  padding: 0.5rem 1rem;
  font-size: 1rem;
  cursor: pointer;
  transition:
    background 0.2s,
    color 0.2s,
    border 0.2s;
  min-width: 120px;
  min-height: 42px;
  display: inline-flex;
  align-items: center;
  justify-content: center;
}

.view-step-history-link:hover {
  background: #8fd4eb;
  color: #327188;
}

.goals-spinner-wrap {
  display: flex;
  align-items: center;
  justify-content: center;
  min-height: 60px;
}
.spinner {
  display: inline-block;
  width: 2em;
  height: 2em;
  border: 3px solid #e0e0e0;
  border-top: 3px solid #43a047;
  border-radius: 50%;
  animation: spin 0.8s linear infinite;
  vertical-align: middle;
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
