<template>
  <div class="modal-overlay" @click.self="emit('close')">
    <div class="modal-content">
      <div class="modal-header">
        <h2>Add a Hobby</h2>
      </div>
      <div class="modal-body">
        <label for="hobbyName">Hobby Name</label>
        <input
          id="hobbyName"
          v-model="hobbyName"
          type="text"
          placeholder="Enter hobby name"
          @keyup.enter="submitHobby"
        />
      </div>
      <div class="modal-footer">
        <button @click="emit('close')" class="cancel-btn">Cancel</button>
        <button @click="submitHobby" :disabled="!hobbyName.trim()" class="add-btn">
          Add Hobby
        </button>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'
const emit = defineEmits(['add', 'close'])
const hobbyName = ref('')
const submitHobby = () => {
  if (hobbyName.value.trim()) {
    emit('add', hobbyName.value.trim())
    hobbyName.value = ''
  }
}
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
  border-radius: 16px;
  padding: 2rem;
  min-width: 320px;
}
.modal-header h2 {
  margin: 0 0 1rem 0;
  color: #388e3c;
  font-size: 1.5rem;
}
.modal-body {
  margin-bottom: 1.5rem;
}
.modal-body label {
  display: block;
  margin-bottom: 0.5rem;
  color: #333;
}
.modal-body input {
  width: 100%;
  padding: 0.75rem;
  border-radius: 8px;
  border: 1px solid #e9ecef;
  font-size: 1rem;
}
.modal-footer {
  display: flex;
  justify-content: flex-end;
  gap: 1rem;
}
.cancel-btn {
  background: #f8f9fa;
  color: #666;
  border: none;
  padding: 0.75rem 1.5rem;
  border-radius: 8px;
  cursor: pointer;
}

.add-btn {
  background: #388e3c;
  color: white;
  border: none;
  padding: 0.5rem 1rem;
  border-radius: 6px;
  cursor: pointer;
  font-weight: 500;

}

.add-btn:hover {
  background: #256b28;
}

.add-btn:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}
</style>
