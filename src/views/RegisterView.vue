<template>
  <div class="auth-container">
    <div class="auth-card">
      <h1>Join HobbySprout</h1>
      <p class="subtitle">Start your hobby journey today</p>

      <form @submit.prevent="handleRegister" class="auth-form">
        <div class="form-group">
          <label for="username">Username</label>
          <input
            id="username"
            v-model="form.username"
            type="text"
            required
            :disabled="loading"
            placeholder="Choose a username"
          />
          <div v-if="errors.username" class="error-message">{{ errors.username }}</div>
        </div>

        <div class="form-group">
          <label for="password">Password</label>
          <input
            id="password"
            v-model="form.password"
            type="password"
            required
            :disabled="loading"
            placeholder="Create a password"
          />
          <div v-if="errors.password" class="error-message">{{ errors.password }}</div>
        </div>

        <div class="form-group">
          <label for="confirmPassword">Confirm Password</label>
          <input
            id="confirmPassword"
            v-model="form.confirmPassword"
            type="password"
            required
            :disabled="loading"
            placeholder="Confirm your password"
          />
          <div v-if="errors.confirmPassword" class="error-message">
            {{ errors.confirmPassword }}
          </div>
        </div>

        <button type="submit" :disabled="loading || !isFormValid" class="auth-button">
          {{ loading ? 'Creating Account...' : 'Create Account' }}
        </button>

        <div v-if="errors.general" class="error-message general-error">{{ errors.general }}</div>
      </form>

      <div class="auth-footer">
        <p>
          Already have an account?
          <router-link to="/login" class="auth-link">Sign in here</router-link>
        </p>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'
import { useRouter } from 'vue-router'
import { useAuthStore } from '@/stores/auth'
import { isValidPassword } from '@/utils'

const router = useRouter()
const authStore = useAuthStore()

const loading = ref(false)
const form = ref({
  username: '',
  password: '',
  confirmPassword: '',
})

const errors = ref({
  username: '',
  password: '',
  confirmPassword: '',
  general: '',
})

const isFormValid = computed(() => {
  return (
    form.value.username.trim().length > 0 &&
    form.value.password.length > 0 &&
    form.value.confirmPassword.length > 0
  )
})

const validateForm = () => {
  errors.value = { username: '', password: '', confirmPassword: '', general: '' }

  if (!form.value.username.trim()) {
    errors.value.username = 'Username is required'
    return false
  }

  if (form.value.username.trim().length < 3) {
    errors.value.username = 'Username must be at least 3 characters'
    return false
  }

  if (!form.value.password) {
    errors.value.password = 'Password is required'
    return false
  }

  if (!isValidPassword(form.value.password)) {
    errors.value.password =
      'Password must be at least 8 characters with uppercase, lowercase, and number'
    return false
  }

  if (form.value.password !== form.value.confirmPassword) {
    errors.value.confirmPassword = 'Passwords do not match'
    return false
  }

  return true
}

const handleRegister = async () => {
  if (!validateForm()) return

  loading.value = true
  errors.value.general = ''

  try {
    const success = await authStore.register(form.value.username, form.value.password)

    if (success) {
      router.push('/dashboard')
    } else {
      errors.value.general = 'Registration failed. Username may already be taken.'
    }
  } catch (error: any) {
    errors.value.general = error.message || 'An error occurred during registration'
  } finally {
    loading.value = false
  }
}
</script>

<style scoped>
.auth-container {
  min-height: 100vh;
  display: flex;
  align-items: center;
  justify-content: center;
  background: linear-gradient(135deg, #81c784 0%, #388e3c 100%);
  padding: 1rem;
}

.auth-card {
  background: white;
  border-radius: 12px;
  padding: 2rem;
  box-shadow: 0 10px 30px rgba(0, 0, 0, 0.1);
  width: 100%;
  max-width: 400px;
}

h1 {
  text-align: center;
  color: #333;
  margin-bottom: 0.5rem;
  font-size: 1.8rem;
  font-weight: 600;
}

.subtitle {
  text-align: center;
  color: #666;
  margin-bottom: 2rem;
  font-size: 0.9rem;
}

.auth-form {
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.form-group {
  display: flex;
  flex-direction: column;
}

label {
  font-weight: 500;
  color: #333;
  margin-bottom: 0.5rem;
  font-size: 0.9rem;
}

input {
  padding: 0.75rem;
  border: 2px solid #e1e5e9;
  border-radius: 8px;
  font-size: 1rem;
  transition: border-color 0.2s;
}

input:focus {
  outline: none;
  border-color: #388e3c;
}

input:disabled {
  background-color: #f5f5f5;
  cursor: not-allowed;
}

.auth-button {
  background: linear-gradient(135deg, #81c784 0%, #388e3c 100%);
  color: white;
  border: none;
  padding: 0.75rem;
  border-radius: 8px;
  font-size: 1rem;
  font-weight: 500;
  cursor: pointer;
  transition: transform 0.2s;
  margin-top: 1rem;
}

.auth-button:hover:not(:disabled) {
  transform: translateY(-2px);
}

.auth-button:disabled {
  background: #ccc;
  cursor: not-allowed;
  transform: none;
}

.error-message {
  color: #e74c3c;
  font-size: 0.85rem;
  margin-top: 0.25rem;
}

.general-error {
  margin-top: 1rem;
  padding: 0.5rem;
  background-color: #fee;
  border: 1px solid #fcc;
  border-radius: 4px;
  text-align: center;
}

.auth-footer {
  text-align: center;
  margin-top: 2rem;
  padding-top: 1rem;
  border-top: 1px solid #eee;
}

.auth-footer p {
  color: #666;
  font-size: 0.9rem;
  margin: 0;
}

.auth-link {
  color: #388e3c;
  text-decoration: none;
  font-weight: 500;
}

.auth-link:hover {
  text-decoration: underline;
}
</style>
