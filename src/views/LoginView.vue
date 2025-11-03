<template>
  <div class="auth-container">
    <div class="auth-card">
      <h1>Welcome Back to HobbySprout</h1>
      <p class="subtitle">Sign in to continue your hobby journey</p>

      <form @submit.prevent="handleLogin" class="auth-form">
        <div class="form-group">
          <label for="username">Username</label>
          <input
            id="username"
            v-model="form.username"
            type="text"
            required
            :disabled="loading"
            placeholder="Enter your username"
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
            placeholder="Enter your password"
          />
          <div v-if="errors.password" class="error-message">{{ errors.password }}</div>
        </div>

        <button type="submit" :disabled="loading || !isFormValid" class="auth-button">
          {{ loading ? 'Signing In...' : 'Sign In' }}
        </button>

        <div v-if="errors.general" class="error-message general-error">{{ errors.general }}</div>
      </form>

      <div class="auth-footer">
        <p>
          Don't have an account?
          <router-link to="/register" class="auth-link">Sign up here</router-link>
        </p>
        <p>
          <router-link to="/" class="auth-link">Back to Home</router-link>
        </p>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'
import { useRouter } from 'vue-router'
import { useAuthStore } from '@/stores/auth'

const router = useRouter()
const authStore = useAuthStore()

const loading = ref(false)
const form = ref({
  username: '',
  password: '',
})

const errors = ref({
  username: '',
  password: '',
  general: '',
})

const isFormValid = computed(() => {
  return form.value.username.trim().length > 0 && form.value.password.length > 0
})

const validateForm = () => {
  errors.value = { username: '', password: '', general: '' }

  if (!form.value.username.trim()) {
    errors.value.username = 'Username is required'
    return false
  }

  if (!form.value.password) {
    errors.value.password = 'Password is required'
    return false
  }

  if (form.value.password.length < 6) {
    errors.value.password = 'Password must be at least 6 characters'
    return false
  }

  return true
}

const handleLogin = async () => {
  if (!validateForm()) return

  loading.value = true
  errors.value.general = ''

  try {
    const success = await authStore.login(form.value.username, form.value.password)

    if (success) {
      router.push('/dashboard')
    } else {
      errors.value.general = 'Invalid username or password'
    }
  } catch (error: any) {
    errors.value.general = error.message || 'An error occurred during login'
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
  background: #bce7bd;
  padding: 1rem;
}

.auth-card {
  background: white;
  border-radius: 12px;
  padding: 2rem;
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
  background: #388e3c;
  color: white;
  border: none;
  padding: 0.75rem;
  border-radius: 8px;
  font-size: 1rem;
  font-weight: 500;
  cursor: pointer;
  margin-top: 1rem;
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

.auth-button {
  background: #388e3c;
  color: #fff;
  border: none;
  padding: 1rem 2.5rem;
  border-radius: 999px;
  font-size: 1.13rem;
  font-weight: 600;
  cursor: pointer;
  margin-top: 1rem;
}
.auth-button:hover:not(:disabled) {
  background: #256b28;
  color: #fff;
}
.auth-button:disabled {
  background: #ccc;
  cursor: not-allowed;
  color: #fff;
}
.auth-link {
  color: #388e3c;
  text-decoration: none;
  font-weight: 600;
  padding: 0.7rem 1.7rem;
  border-radius: 999px;
  transition:
    background 0.2s,
    color 0.2s;
  background: transparent;
  display: inline-block;
}
.auth-link:hover {
  background: #e8f5e9;
  color: #256b28;
  text-decoration: none;
}
.auth-footer p {
  color: #666;
  font-size: 0.9rem;
  margin: 0;
}

.auth-link {
  color: #388e3c;
  text-decoration: none;
  font-weight: 600;
  padding: 0.7rem 1.7rem;
  border-radius: 999px;
  transition:
    background 0.2s,
    color 0.2s;
  background: transparent;
  display: inline-block;
}
.auth-link:hover {
  background: #e8f5e9;
  color: #256b28;
  text-decoration: none;
}
</style>
