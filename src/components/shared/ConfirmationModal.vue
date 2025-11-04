<template>
  <div v-if="show" class="modal-overlay">
    <div class="modal-content">
      <h3>{{ title }}</h3>
      <p>{{ message }}</p>
      <div class="modal-actions">
        <button @click="$emit('confirm')" class="confirm">{{ confirmText }}</button>
        <button @click="$emit('cancel')" class="cancel">{{ cancelText }}</button>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
defineProps({
  show: Boolean,
  title: { type: String, default: 'Are you sure?' },
  message: { type: String, default: '' },
  confirmText: { type: String, default: 'Yes' },
  cancelText: { type: String, default: 'Cancel' },
})
</script>

<style scoped>
.modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.3);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
}
.modal-content {
  background: #fff;
  border-radius: 12px;
  padding: 2rem 2.5rem;
  box-shadow: 0 2px 16px rgba(0, 0, 0, 0.15);
  min-width: 320px;
  max-width: 90vw;
}
.modal-actions {
  display: flex;
  gap: 1rem;
  margin-top: 1.5rem;
  justify-content: flex-end;
}
button.confirm {
  background: #d32f2f;
  color: #fff;
  border: none;
  padding: 0.5rem 1.2rem;
  border-radius: 6px;
  font-weight: 600;
  cursor: pointer;
  transition: background 0.2s;
}
button.confirm:hover {
  background: #b71c1c;
}
button.cancel {
  background: #eee;
  color: #333;
  border: none;
  padding: 0.5rem 1.2rem;
  border-radius: 6px;
  font-weight: 600;
  cursor: pointer;
}
button.cancel:hover {
  background: #ccc;
}
</style>
