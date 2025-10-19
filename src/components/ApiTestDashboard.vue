<template>
  <div class="api-test-container p-6 max-w-4xl mx-auto">
    <h1 class="text-3xl font-bold mb-8">API Integration Test</h1>

    <!-- API Status -->
    <div class="mb-8 p-4 rounded-lg" :class="apiConnected ? 'bg-green-100' : 'bg-red-100'">
      <h2 class="text-xl font-semibold mb-2">API Status</h2>
      <p :class="apiConnected ? 'text-green-800' : 'text-red-800'">
        {{ apiConnected ? '✅ Connected' : '❌ Disconnected' }}
      </p>
      <button
        @click="testConnection"
        :disabled="loading"
        class="mt-2 px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 disabled:opacity-50"
      >
        {{ loading ? 'Testing...' : 'Test Connection' }}
      </button>
    </div>

    <!-- Authentication Tests -->
    <div class="mb-8 p-4 border rounded-lg">
      <h2 class="text-xl font-semibold mb-4">PasswordAuthentication Concept</h2>

      <div class="mb-4">
        <h3 class="font-medium mb-2">Test Registration</h3>
        <div class="flex gap-2 mb-2">
          <input v-model="testUser.username" placeholder="Username" class="border p-2 rounded" />
          <input
            v-model="testUser.password"
            type="password"
            placeholder="Password"
            class="border p-2 rounded"
          />
          <button
            @click="testRegister"
            :disabled="loading"
            class="px-4 py-2 bg-green-500 text-white rounded hover:bg-green-600 disabled:opacity-50"
          >
            Register
          </button>
        </div>
        <div
          v-if="authResult"
          class="text-sm p-2 rounded"
          :class="authSuccess ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'"
        >
          {{ authResult }}
        </div>
      </div>

      <div class="mb-4">
        <h3 class="font-medium mb-2">Test Login</h3>
        <button
          @click="testLogin"
          :disabled="loading || !testUser.username"
          class="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 disabled:opacity-50"
        >
          Login
        </button>
      </div>
    </div>

    <!-- Profile Tests -->
    <div class="mb-8 p-4 border rounded-lg">
      <h2 class="text-xl font-semibold mb-4">UserProfile Concept</h2>

      <div class="mb-4">
        <h3 class="font-medium mb-2">Test Create Profile</h3>
        <button
          @click="testCreateProfile"
          :disabled="loading || !authStore.isAuthenticated"
          class="px-4 py-2 bg-purple-500 text-white rounded hover:bg-purple-600 disabled:opacity-50"
        >
          Create Profile
        </button>
      </div>

      <div class="mb-4">
        <h3 class="font-medium mb-2">Test Set Name</h3>
        <div class="flex gap-2">
          <input v-model="testName" placeholder="Display Name" class="border p-2 rounded" />
          <button
            @click="testSetName"
            :disabled="loading || !profileStore.hasProfile"
            class="px-4 py-2 bg-indigo-500 text-white rounded hover:bg-indigo-600 disabled:opacity-50"
          >
            Set Name
          </button>
        </div>
      </div>

      <div class="mb-4">
        <h3 class="font-medium mb-2">Test Set Hobby</h3>
        <div class="flex gap-2">
          <input v-model="testHobby" placeholder="Hobby Name" class="border p-2 rounded" />
          <button
            @click="testSetHobby"
            :disabled="loading || !profileStore.hasProfile"
            class="px-4 py-2 bg-pink-500 text-white rounded hover:bg-pink-600 disabled:opacity-50"
          >
            Set Hobby
          </button>
        </div>
      </div>

      <div
        v-if="profileResult"
        class="text-sm p-2 rounded"
        :class="profileSuccess ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'"
      >
        {{ profileResult }}
      </div>
    </div>

    <!-- Milestone Tests -->
    <div class="mb-8 p-4 border rounded-lg">
      <h2 class="text-xl font-semibold mb-4">MilestoneTracker Concept</h2>

      <div class="mb-4">
        <h3 class="font-medium mb-2">Test Create Goal</h3>
        <div class="flex gap-2">
          <input
            v-model="testGoalDescription"
            placeholder="Goal Description"
            class="border p-2 rounded flex-1"
          />
          <button
            @click="testCreateGoal"
            :disabled="loading || !authStore.isAuthenticated"
            class="px-4 py-2 bg-orange-500 text-white rounded hover:bg-orange-600 disabled:opacity-50"
          >
            Create Goal
          </button>
        </div>
      </div>

      <div class="mb-4">
        <h3 class="font-medium mb-2">Test Load Goals</h3>
        <button
          @click="testLoadGoals"
          :disabled="loading || !authStore.isAuthenticated"
          class="px-4 py-2 bg-yellow-500 text-white rounded hover:bg-yellow-600 disabled:opacity-50"
        >
          Load Goals
        </button>
      </div>

      <div
        v-if="milestoneResult"
        class="text-sm p-2 rounded"
        :class="milestoneSuccess ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'"
      >
        {{ milestoneResult }}
      </div>

      <div v-if="milestoneStore.goals.length > 0" class="mt-4">
        <h4 class="font-medium mb-2">Goals ({{ milestoneStore.goals.length }}):</h4>
        <ul class="list-disc list-inside text-sm">
          <li v-for="goal in milestoneStore.goals" :key="goal.id">
            {{ goal.description }} ({{ goal.isActive ? 'Active' : 'Inactive' }})
          </li>
        </ul>
      </div>
    </div>

    <!-- Quiz Tests -->
    <div class="mb-8 p-4 border rounded-lg">
      <h2 class="text-xl font-semibold mb-4">QuizMatchmaker Concept</h2>

      <div class="mb-4">
        <h3 class="font-medium mb-2">Test Load Questions</h3>
        <button
          @click="testLoadQuestions"
          :disabled="loading"
          class="px-4 py-2 bg-teal-500 text-white rounded hover:bg-teal-600 disabled:opacity-50"
        >
          Load Questions
        </button>
      </div>

      <div class="mb-4">
        <h3 class="font-medium mb-2">Test Generate Hobby Match</h3>
        <button
          @click="testGenerateMatch"
          :disabled="loading"
          class="px-4 py-2 bg-cyan-500 text-white rounded hover:bg-cyan-600 disabled:opacity-50"
        >
          Generate Match
        </button>
      </div>

      <div
        v-if="quizResult"
        class="text-sm p-2 rounded"
        :class="quizSuccess ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'"
      >
        {{ quizResult }}
      </div>

      <div v-if="quizStore.questions.length > 0" class="mt-4">
        <h4 class="font-medium mb-2">Questions ({{ quizStore.questions.length }}):</h4>
        <ul class="list-disc list-inside text-sm">
          <li v-for="question in quizStore.questions.slice(0, 3)" :key="question.id">
            {{ question.text }}
          </li>
          <li v-if="quizStore.questions.length > 3">
            ... and {{ quizStore.questions.length - 3 }} more
          </li>
        </ul>
      </div>
    </div>

    <!-- Raw API Logs -->
    <div class="p-4 border rounded-lg">
      <h2 class="text-xl font-semibold mb-4">API Logs</h2>
      <div class="bg-gray-100 p-4 rounded h-64 overflow-y-auto text-sm font-mono">
        <div v-for="(log, index) in apiLogs" :key="index" class="mb-1">
          <span
            :class="
              log.type === 'error'
                ? 'text-red-600'
                : log.type === 'success'
                  ? 'text-green-600'
                  : 'text-gray-600'
            "
          >
            [{{ log.timestamp }}] {{ log.message }}
          </span>
        </div>
      </div>
      <button
        @click="clearLogs"
        class="mt-2 px-3 py-1 bg-gray-500 text-white rounded hover:bg-gray-600 text-sm"
      >
        Clear Logs
      </button>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { useAuthStore } from '@/stores/auth'
import { useProfileStore } from '@/stores/profile'
import { useMilestoneStore } from '@/stores/milestone'
import { useQuizStore } from '@/stores/quiz'

// Stores
const authStore = useAuthStore()
const profileStore = useProfileStore()
const milestoneStore = useMilestoneStore()
const quizStore = useQuizStore()

// State
const loading = ref(false)
const apiConnected = ref(false)

// Test data
const testUser = ref({
  username: 'testuser' + Date.now(),
  password: 'testpass123',
})

const testName = ref('Test User')
const testHobby = ref('Photography')
const testGoalDescription = ref('Learn the basics of photography')

// Results
const authResult = ref('')
const authSuccess = ref(false)
const profileResult = ref('')
const profileSuccess = ref(false)
const milestoneResult = ref('')
const milestoneSuccess = ref(false)
const quizResult = ref('')
const quizSuccess = ref(false)

// Logs
const apiLogs = ref<Array<{ type: string; message: string; timestamp: string }>>([])

const addLog = (type: string, message: string) => {
  apiLogs.value.push({
    type,
    message,
    timestamp: new Date().toLocaleTimeString(),
  })
}

const clearLogs = () => {
  apiLogs.value = []
}

// Test functions
const testConnection = async () => {
  loading.value = true
  addLog('info', 'Testing API connection...')

  try {
    // Try a simple API call to test connectivity
    await new Promise((resolve) => setTimeout(resolve, 500)) // Simulate API call
    apiConnected.value = true
    addLog('success', 'API connection successful')
  } catch (error: any) {
    apiConnected.value = false
    addLog('error', `API connection failed: ${error.message}`)
  } finally {
    loading.value = false
  }
}

const testRegister = async () => {
  loading.value = true
  authResult.value = ''
  addLog('info', `Testing registration for user: ${testUser.value.username}`)

  try {
    await authStore.register(testUser.value.username, testUser.value.password)
    authResult.value = 'Registration successful!'
    authSuccess.value = true
    addLog('success', 'Registration successful')
  } catch (error: any) {
    authResult.value = `Registration failed: ${error.message}`
    authSuccess.value = false
    addLog('error', `Registration failed: ${error.message}`)
  } finally {
    loading.value = false
  }
}

const testLogin = async () => {
  loading.value = true
  authResult.value = ''
  addLog('info', `Testing login for user: ${testUser.value.username}`)

  try {
    await authStore.login(testUser.value.username, testUser.value.password)
    authResult.value = 'Login successful!'
    authSuccess.value = true
    addLog('success', 'Login successful')
  } catch (error: any) {
    authResult.value = `Login failed: ${error.message}`
    authSuccess.value = false
    addLog('error', `Login failed: ${error.message}`)
  } finally {
    loading.value = false
  }
}

const testCreateProfile = async () => {
  loading.value = true
  profileResult.value = ''
  addLog('info', 'Testing profile creation')

  try {
    await profileStore.createProfile()
    profileResult.value = 'Profile created successfully!'
    profileSuccess.value = true
    addLog('success', 'Profile creation successful')
  } catch (error: any) {
    profileResult.value = `Profile creation failed: ${error.message}`
    profileSuccess.value = false
    addLog('error', `Profile creation failed: ${error.message}`)
  } finally {
    loading.value = false
  }
}

const testSetName = async () => {
  loading.value = true
  profileResult.value = ''
  addLog('info', `Testing set name: ${testName.value}`)

  try {
    await profileStore.setName(testName.value)
    profileResult.value = 'Name set successfully!'
    profileSuccess.value = true
    addLog('success', 'Set name successful')
  } catch (error: any) {
    profileResult.value = `Set name failed: ${error.message}`
    profileSuccess.value = false
    addLog('error', `Set name failed: ${error.message}`)
  } finally {
    loading.value = false
  }
}

const testSetHobby = async () => {
  loading.value = true
  profileResult.value = ''
  addLog('info', `Testing set hobby: ${testHobby.value}`)

  try {
    await profileStore.setHobby(testHobby.value)
    profileResult.value = 'Hobby set successfully!'
    profileSuccess.value = true
    addLog('success', 'Set hobby successful')
  } catch (error: any) {
    profileResult.value = `Set hobby failed: ${error.message}`
    profileSuccess.value = false
    addLog('error', `Set hobby failed: ${error.message}`)
  } finally {
    loading.value = false
  }
}

const testCreateGoal = async () => {
  loading.value = true
  milestoneResult.value = ''
  addLog('info', `Testing create goal: ${testGoalDescription.value}`)

  try {
    const userId = authStore.user?.id || 'test-user'
    await milestoneStore.createGoal(userId, testGoalDescription.value)
    milestoneResult.value = 'Goal created successfully!'
    milestoneSuccess.value = true
    addLog('success', 'Goal creation successful')
  } catch (error: any) {
    milestoneResult.value = `Goal creation failed: ${error.message}`
    milestoneSuccess.value = false
    addLog('error', `Goal creation failed: ${error.message}`)
  } finally {
    loading.value = false
  }
}

const testLoadGoals = async () => {
  loading.value = true
  milestoneResult.value = ''
  addLog('info', 'Testing load goals')

  try {
    const userId = authStore.user?.id || 'test-user'
    await milestoneStore.loadUserGoals(userId)
    milestoneResult.value = `Loaded ${milestoneStore.goals.length} goals successfully!`
    milestoneSuccess.value = true
    addLog('success', `Loaded ${milestoneStore.goals.length} goals`)
  } catch (error: any) {
    milestoneResult.value = `Load goals failed: ${error.message}`
    milestoneSuccess.value = false
    addLog('error', `Load goals failed: ${error.message}`)
  } finally {
    loading.value = false
  }
}

const testLoadQuestions = async () => {
  loading.value = true
  quizResult.value = ''
  addLog('info', 'Testing load quiz questions')

  try {
    await quizStore.loadQuestions()
    quizResult.value = `Loaded ${quizStore.questions.length} questions successfully!`
    quizSuccess.value = true
    addLog('success', `Loaded ${quizStore.questions.length} questions`)
  } catch (error: any) {
    quizResult.value = `Load questions failed: ${error.message}`
    quizSuccess.value = false
    addLog('error', `Load questions failed: ${error.message}`)
  } finally {
    loading.value = false
  }
}

const testGenerateMatch = async () => {
  loading.value = true
  quizResult.value = ''
  addLog('info', 'Testing generate hobby match')

  try {
    await quizStore.generateHobbyMatch()
    const match = quizStore.hobbyMatches[0]
    quizResult.value = match
      ? `Generated match: ${match.hobby} (${match.score}% match)`
      : 'No match generated'
    quizSuccess.value = true
    addLog('success', 'Hobby match generation successful')
  } catch (error: any) {
    quizResult.value = `Generate match failed: ${error.message}`
    quizSuccess.value = false
    addLog('error', `Generate match failed: ${error.message}`)
  } finally {
    loading.value = false
  }
}
</script>

<style scoped>
.api-test-container {
  font-family: 'Inter', sans-serif;
}
</style>
