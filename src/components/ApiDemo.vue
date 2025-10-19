<template>
  <div class="api-demo">
    <h2>HobbySprout API Demo</h2>

    <div class="section">
      <h3>API Connection Status</h3>
      <p>Backend URL: <code>http://localhost:8000/api</code></p>
      <button @click="testConnection" :disabled="loading">
        {{ loading ? 'Testing...' : 'Test API Connection' }}
      </button>

      <div v-if="connectionStatus" class="status" :class="connectionStatus.type">
        {{ connectionStatus.message }}
      </div>
    </div>

    <div class="section">
      <h3>Quick Backend Test</h3>
      <p>Since your backend is running, let's test it step by step:</p>
      <div class="debug-buttons">
        <button @click="testBackendRoot" :disabled="loading">Test Backend Root</button>
        <button @click="testWithCurl" :disabled="loading">Show cURL Example</button>
        <button @click="testSimpleAPI" :disabled="loading">Test Simple API Call</button>
      </div>

      <div v-if="debugResponse" class="response">
        <h4>Debug Response:</h4>
        <pre>{{ JSON.stringify(debugResponse, null, 2) }}</pre>
      </div>
    </div>

    <div class="section" v-if="debugResponse && debugResponse.error === 'Failed to fetch'">
      <h3>🚨 CORS Issue Detected</h3>
      <div class="cors-help">
        <p>
          <strong
            >The "Failed to fetch" error indicates a CORS (Cross-Origin Resource Sharing)
            issue.</strong
          >
        </p>
        <p>
          Your Deno backend needs to include CORS headers to allow browser requests from
          <code>http://localhost:5173</code>
        </p>

        <h4>Quick Fix for your Deno Backend:</h4>
        <div class="cors-code">
          <p>Add this to your Deno server before handling requests:</p>
          <pre><code>// Add CORS headers to every response
const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET, POST, PUT, DELETE, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type, Authorization",
};

// Handle preflight OPTIONS requests
if (request.method === "OPTIONS") {
  return new Response(null, { status: 200, headers: corsHeaders });
}

// Add CORS headers to your API responses
return new Response(JSON.stringify(responseData), {
  status: 200,
  headers: {
    "Content-Type": "application/json",
    ...corsHeaders,
  },
});</code></pre>
        </div>

        <p>
          <strong>Alternative:</strong> You can test the API works by trying the cURL example above
          - it should work fine from terminal.
        </p>
      </div>
    </div>

    <div class="section">
      <h3>Sample API Call</h3>
      <button @click="sampleApiCall" :disabled="loading">Make Sample API Call</button>

      <div v-if="apiResponse" class="response">
        <h4>Response:</h4>
        <pre>{{ JSON.stringify(apiResponse, null, 2) }}</pre>
      </div>
    </div>

    <div class="section">
      <h3>Test Concept Endpoints</h3>
      <p>Try different concept-based API calls (format: POST /api/{conceptName}/{actionName})</p>

      <div class="concept-test">
        <input v-model="conceptName" placeholder="Concept Name (e.g., User, Hobby)" />
        <input v-model="actionName" placeholder="Action Name (e.g., create, _getAll)" />
        <button @click="testConceptEndpoint" :disabled="loading">Test Concept Call</button>
      </div>

      <div v-if="conceptResponse" class="response">
        <h4>Concept Response:</h4>
        <pre>{{ JSON.stringify(conceptResponse, null, 2) }}</pre>
      </div>
    </div>

    <div class="section">
      <h3>Available Concepts</h3>
      <p>Your backend has these concepts implemented:</p>

      <div class="concept-examples">
        <div class="concept-card">
          <h4>PasswordAuthentication</h4>
          <button @click="testPasswordAuth" :disabled="loading">Test Register User</button>
        </div>

        <div class="concept-card">
          <h4>UserProfile</h4>
          <button @click="testUserProfile" :disabled="loading">Test Create Profile</button>
        </div>

        <div class="concept-card">
          <h4>MilestoneTracker</h4>
          <button @click="testMilestoneTracker" :disabled="loading">Test Create Goal</button>
        </div>

        <div class="concept-card">
          <h4>QuizMatchmaker</h4>
          <button @click="testQuizMatchmaker" :disabled="loading">Test Quiz</button>
        </div>
      </div>

      <div v-if="exampleResponse" class="response">
        <h4>Example Response:</h4>
        <pre>{{ JSON.stringify(exampleResponse, null, 2) }}</pre>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { ApiService } from '@/services/api'
import HobbySproutService from '@/services/hobbySprout'

const loading = ref(false)
const connectionStatus = ref<{ type: 'success' | 'error'; message: string } | null>(null)
const apiResponse = ref<any>(null)
const conceptResponse = ref<any>(null)
const exampleResponse = ref<any>(null)
const debugResponse = ref<any>(null)
const conceptName = ref('PasswordAuthentication')
const actionName = ref('register')

const testConnection = async () => {
  loading.value = true
  connectionStatus.value = null

  try {
    // Test the base API endpoint first
    const response = await fetch('http://localhost:8000/api', {
      method: 'GET',
      mode: 'cors',
      headers: {
        'Content-Type': 'application/json',
      },
    })

    if (response.ok) {
      const text = await response.text()
      connectionStatus.value = {
        type: 'success',
        message: `Successfully connected to the backend! Response: ${text}`,
      }
    } else {
      connectionStatus.value = {
        type: 'error',
        message: `Backend responded with status: ${response.status} - ${response.statusText}`,
      }
    }
  } catch (error: any) {
    console.error('Connection test error:', error)
    connectionStatus.value = {
      type: 'error',
      message: `Failed to connect: ${error.message}. Make sure your backend is running at http://localhost:8000`,
    }
  } finally {
    loading.value = false
  }
}

const sampleApiCall = async () => {
  loading.value = true
  apiResponse.value = null

  try {
    // Test a basic concept-based API call
    // This follows the pattern: POST /api/{conceptName}/{actionName}
    const response = await fetch('http://localhost:8000/api', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        endpoint: 'test',
        message: 'Hello from frontend',
      }),
    })

    const data = await response.json()
    apiResponse.value = {
      status: response.status,
      data: data,
    }
  } catch (error: any) {
    apiResponse.value = {
      error: `API call failed: ${error.message}`,
      details: 'Make sure your backend concept server is running and accessible.',
    }
  } finally {
    loading.value = false
  }
}

// Debug functions
const testBackendRoot = async () => {
  loading.value = true
  debugResponse.value = null

  try {
    const response = await fetch('http://localhost:8000', {
      method: 'GET',
      mode: 'cors',
    })

    const text = await response.text()
    debugResponse.value = {
      test: 'Backend Root',
      status: response.status,
      statusText: response.statusText,
      headers: Object.fromEntries(response.headers.entries()),
      body: text,
    }
  } catch (error: any) {
    debugResponse.value = {
      test: 'Backend Root',
      error: error.message,
      name: error.name,
    }
  } finally {
    loading.value = false
  }
}

const testWithCurl = async () => {
  debugResponse.value = {
    test: 'cURL Example',
    note: 'Your backend works with cURL. Try this command in terminal:',
    command:
      'curl -X POST http://localhost:8000/api/PasswordAuthentication/register -H "Content-Type: application/json" -d \'{"username":"testuser","password":"testpass"}\'',
    result: 'This worked and returned: {"user":"0199fda9-1538-7870-9481-fb7b981b378b"}',
    issue: 'The issue is likely CORS when making requests from the browser vs terminal',
  }
}

const testSimpleAPI = async () => {
  loading.value = true
  debugResponse.value = null

  try {
    const response = await fetch('http://localhost:8000/api/PasswordAuthentication/register', {
      method: 'POST',
      mode: 'cors',
      credentials: 'omit',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        username: 'browsertest_' + Date.now(),
        password: 'testpass123',
      }),
    })

    const data = await response.json()
    debugResponse.value = {
      test: 'Simple API Call',
      status: response.status,
      statusText: response.statusText,
      headers: Object.fromEntries(response.headers.entries()),
      data,
    }
  } catch (error: any) {
    debugResponse.value = {
      test: 'Simple API Call',
      error: error.message,
      name: error.name,
      stack: error.stack,
    }
  } finally {
    loading.value = false
  }
}

const testConceptEndpoint = async () => {
  loading.value = true
  conceptResponse.value = null

  try {
    const endpoint = `http://localhost:8000/api/${conceptName.value}/${actionName.value}`
    const response = await fetch(endpoint, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        // Add any test data here
        test: true,
      }),
    })

    const data = await response.json()
    conceptResponse.value = {
      endpoint: endpoint,
      status: response.status,
      data: data,
    }
  } catch (error: any) {
    conceptResponse.value = {
      endpoint: `http://localhost:8000/api/${conceptName.value}/${actionName.value}`,
      error: `Concept call failed: ${error.message}`,
      details: 'Check if the concept and action exist on your backend.',
    }
  } finally {
    loading.value = false
  }
}

// Test actual concept endpoints
const testPasswordAuth = async () => {
  loading.value = true
  exampleResponse.value = null

  try {
    const response = await fetch('http://localhost:8000/api/PasswordAuthentication/register', {
      method: 'POST',
      mode: 'cors',
      headers: {
        'Content-Type': 'application/json',
        Accept: 'application/json',
      },
      body: JSON.stringify({
        username: 'testuser_' + Date.now(),
        password: 'testpass123',
      }),
    })

    const data = await response.json()
    exampleResponse.value = {
      endpoint: 'PasswordAuthentication/register',
      status: response.status,
      statusText: response.statusText,
      data,
    }
  } catch (error: any) {
    console.error('PasswordAuth test error:', error)
    exampleResponse.value = {
      error: error.message,
      type: error.name,
      details: 'Check browser console for more details',
    }
  } finally {
    loading.value = false
  }
}

const testUserProfile = async () => {
  loading.value = true
  exampleResponse.value = null

  try {
    const response = await fetch('http://localhost:8000/api/UserProfile/createProfile', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        user: 'user:test_' + Date.now(),
      }),
    })

    const data = await response.json()
    exampleResponse.value = { endpoint: 'UserProfile/createProfile', status: response.status, data }
  } catch (error: any) {
    exampleResponse.value = { error: error.message }
  } finally {
    loading.value = false
  }
}

const testMilestoneTracker = async () => {
  loading.value = true
  exampleResponse.value = null

  try {
    const response = await fetch('http://localhost:8000/api/MilestoneTracker/createGoal', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        user: 'user:test_' + Date.now(),
        description: 'Learn Vue.js frontend development',
      }),
    })

    const data = await response.json()
    exampleResponse.value = {
      endpoint: 'MilestoneTracker/createGoal',
      status: response.status,
      data,
    }
  } catch (error: any) {
    exampleResponse.value = { error: error.message }
  } finally {
    loading.value = false
  }
}

const testQuizMatchmaker = async () => {
  loading.value = true
  exampleResponse.value = null

  try {
    const response = await fetch('http://localhost:8000/api/QuizMatchmaker/startQuiz', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        user: 'user:test_' + Date.now(),
      }),
    })

    const data = await response.json()
    exampleResponse.value = { endpoint: 'QuizMatchmaker/startQuiz', status: response.status, data }
  } catch (error: any) {
    exampleResponse.value = { error: error.message }
  } finally {
    loading.value = false
  }
}
</script>

<style scoped>
.api-demo {
  max-width: 800px;
  margin: 0 auto;
  padding: 2rem;
}

.section {
  margin-bottom: 2rem;
  padding: 1rem;
  border: 1px solid #e0e0e0;
  border-radius: 8px;
}

.status {
  margin-top: 1rem;
  padding: 0.5rem;
  border-radius: 4px;
}

.status.success {
  background-color: #d4edda;
  color: #155724;
  border: 1px solid #c3e6cb;
}

.status.error {
  background-color: #f8d7da;
  color: #721c24;
  border: 1px solid #f5c6cb;
}

.response {
  margin-top: 1rem;
}

.response pre {
  background-color: #f8f9fa;
  padding: 1rem;
  border-radius: 4px;
  overflow-x: auto;
}

button {
  background-color: #42b883;
  color: white;
  border: none;
  padding: 0.5rem 1rem;
  border-radius: 4px;
  cursor: pointer;
}

button:disabled {
  background-color: #6c757d;
  cursor: not-allowed;
}

button:hover:not(:disabled) {
  background-color: #369870;
}

code {
  background-color: #f8f9fa;
  padding: 0.25rem 0.5rem;
  border-radius: 3px;
  font-family: monospace;
}

.concept-test {
  display: flex;
  gap: 0.5rem;
  margin-bottom: 1rem;
  flex-wrap: wrap;
}

.concept-test input {
  padding: 0.5rem;
  border: 1px solid #ccc;
  border-radius: 4px;
  flex: 1;
  min-width: 150px;
}

.concept-test button {
  white-space: nowrap;
}

.concept-examples {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 1rem;
  margin-bottom: 1rem;
}

.concept-card {
  border: 1px solid #e0e0e0;
  border-radius: 8px;
  padding: 1rem;
  text-align: center;
}

.concept-card h4 {
  margin: 0 0 0.5rem 0;
  color: #333;
}

.debug-buttons {
  display: flex;
  gap: 0.5rem;
  margin-bottom: 1rem;
  flex-wrap: wrap;
}

.debug-buttons button {
  background-color: #17a2b8;
  color: white;
}

.debug-buttons button:hover:not(:disabled) {
  background-color: #138496;
}

.cors-help {
  background-color: #fff3cd;
  border: 1px solid #ffeaa7;
  border-radius: 8px;
  padding: 1rem;
  margin: 1rem 0;
}

.cors-help h4 {
  color: #856404;
  margin: 1rem 0 0.5rem 0;
}

.cors-help p {
  margin: 0.5rem 0;
  color: #856404;
}

.cors-code {
  background-color: #f8f9fa;
  border: 1px solid #dee2e6;
  border-radius: 4px;
  padding: 1rem;
  margin: 0.5rem 0;
}

.cors-code pre {
  margin: 0;
  background: none;
  padding: 0;
}

.cors-code code {
  background: none;
  padding: 0;
  font-size: 0.9em;
  line-height: 1.4;
}
</style>
