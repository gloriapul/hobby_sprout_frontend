<template>
  <div class="quiz-view">
    <div class="quiz-header">
      <h1>Hobby Personality Quiz</h1>
      <p class="quiz-description">
        Discover hobbies that match your personality! Answer these questions to get personalized
        recommendations.
      </p>
    </div>

    <div v-if="!quizStarted && !quizCompleted" class="quiz-intro">
      <div class="intro-card">
        <h2>Ready to find your perfect hobby?</h2>
        <p>
          This quiz will ask you about your preferences, interests, and personality traits to
          recommend a hobby that best suits you.
        </p>
        <button @click="startQuiz" class="start-quiz-button">Start Quiz</button>
      </div>
    </div>

    <div v-else-if="quizStarted && !quizCompleted" class="quiz-content">
      <div class="progress-section">
        <div class="progress-bar">
          <div class="progress-fill" :style="{ width: progressPercentage + '%' }"></div>
        </div>
        <span class="progress-text"
          >Question {{ currentQuestionIndex + 1 }} of {{ totalQuestions }}</span
        >
      </div>

      <div v-if="currentQuestion" class="question-card">
        <h2 class="question-text">{{ currentQuestion.text }}</h2>

        <div class="answers-grid">
          <template v-for="answer in currentQuestion.answers" :key="answer.id">
            <button
              v-if="!isDependsAnswer(answer)"
              @click="selectAnswer(answer)"
              class="answer-button"
              :class="{ selected: selectedAnswer?.id === answer.id }"
            >
              {{ answer.text }}
            </button>
            <div v-else class="free-response-option">
              <button
                @click="selectAnswer(answer)"
                class="answer-button"
                :class="{ selected: selectedAnswer?.id === answer.id }"
              >
                Other (please specify)
              </button>
              <textarea
                v-if="selectedAnswer?.id === answer.id"
                v-model="freeResponseText"
                class="free-response-textarea"
                placeholder="Please describe..."
                rows="3"
                style="width: 100%; margin-top: 0.5rem"
              ></textarea>
            </div>
          </template>
        </div>

        <div class="question-actions">
          <button
            @click="previousQuestion"
            :disabled="currentQuestionIndex === 0"
            class="nav-button prev-button"
          >
            ← Previous
          </button>
          <button
            @click="nextQuestion"
            :disabled="!canProceedToNext"
            class="nav-button next-button"
          >
            {{ isLastQuestion ? 'Finish Quiz' : 'Next →' }}
          </button>
        </div>
      </div>
    </div>

    <div v-else-if="quizCompleted" class="quiz-results">
      <div class="results-card">
        <h2>🎉 Quiz Complete!</h2>
        <div v-if="loadingMatch" class="loading-match">
          <div class="loading-spinner"></div>
          <p>Analyzing your responses to find your perfect hobby match...</p>
        </div>
        <div v-else-if="hobbyMatch" class="hobby-recommendation">
          <h3>Your Perfect Hobby Match:</h3>
          <div class="hobby-match-card">
            <h4>{{ hobbyMatch }}</h4>
            <p>This hobby has been carefully selected based on your personality and preferences!</p>
            <div class="action-buttons">
              <button @click="addHobbyToProfile" class="add-hobby-btn">Add to My Hobbies</button>
              <button @click="retakeQuiz" class="retake-btn">Take Quiz Again</button>
            </div>
          </div>
        </div>
        <div v-else class="no-match">
          <div>
            Unable to generate a hobby match.<br />
            <span style="color: #c00; font-weight: 500">Possible reasons:</span>
            <ul style="text-align: left; margin: 0.5em 0 0 1em">
              <li>You may have skipped a question or not answered all quiz questions.</li>
              <li>There may be a temporary server issue.</li>
            </ul>
            Please review your answers and try again.
          </div>
          <button @click="retakeQuiz" class="retake-btn">Retake Quiz</button>
        </div>
      </div>
    </div>

    <div v-if="loading" class="loading-overlay">
      <div class="loading-spinner"></div>
      <p>Processing your answers...</p>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { useAuthStore } from '@/stores/auth'
import { useProfileStore } from '@/stores/profile'
import { ApiService } from '@/services/api'

const router = useRouter()
const authStore = useAuthStore()
const profileStore = useProfileStore()

// Quiz state
const quizStarted = ref(false)
const quizCompleted = ref(false)
const loading = ref(false)
const loadingMatch = ref(false)
const currentQuestionIndex = ref(0)
const selectedAnswer = ref<any>(null)
const freeResponseText = ref('')
const answers = ref<any[]>([])
const hobbyMatch = ref<string | null>(null)

// Official quiz questions from backend spec, with custom answer choices
const quizQuestions = ref([
  {
    id: 'q_1',
    text: 'Do you prefer spending your free time indoors or outdoors?',
    answers: [
      { id: 1, text: 'Indoors', value: 'indoors' },
      { id: 2, text: 'Outdoors', value: 'outdoors' },
      { id: 3, text: 'A mix of both', value: 'mix' },
      { id: 4, text: 'Depends on the season', value: 'seasonal' },
    ],
  },
  {
    id: 'q_2',
    text: 'Are you more drawn to creative activities or analytical challenges?',
    answers: [
      { id: 1, text: 'Creative activities', value: 'creative' },
      { id: 2, text: 'Analytical challenges', value: 'analytical' },
      { id: 3, text: 'Both equally', value: 'both' },
      { id: 4, text: 'Depends on my mood', value: 'mood' },
    ],
  },
  {
    id: 'q_3',
    text: 'How important is social interaction in your ideal hobby?',
    answers: [
      { id: 1, text: 'Very important', value: 'very_important' },
      { id: 2, text: 'Somewhat important', value: 'somewhat_important' },
      { id: 3, text: 'Not important', value: 'not_important' },
      { id: 4, text: 'I prefer solo hobbies', value: 'solo' },
    ],
  },
  {
    id: 'q_4',
    text: 'Do you enjoy learning new skills, or perfecting existing ones?',
    answers: [
      { id: 1, text: 'Learning new skills', value: 'learning' },
      { id: 2, text: 'Perfecting existing skills', value: 'perfecting' },
      { id: 3, text: 'A balance of both', value: 'balance' },
      { id: 4, text: 'Depends on the hobby', value: 'depends' },
    ],
  },
  {
    id: 'q_5',
    text: 'What kind of physical exertion are you comfortable with for a hobby?',
    answers: [
      { id: 1, text: 'High exertion (sports, hiking)', value: 'high' },
      { id: 2, text: 'Moderate exertion (gardening, dancing)', value: 'moderate' },
      { id: 3, text: 'Low exertion (crafting, reading)', value: 'low' },
      { id: 4, text: 'No exertion (chess, writing)', value: 'none' },
    ],
  },
])

const currentQuestion = computed(() => {
  return quizQuestions.value[currentQuestionIndex.value]
})

const totalQuestions = computed(() => quizQuestions.value.length)

const progressPercentage = computed(() => {
  return ((currentQuestionIndex.value + 1) / totalQuestions.value) * 100
})

const isLastQuestion = computed(() => {
  return currentQuestionIndex.value === totalQuestions.value - 1
})

const startQuiz = () => {
  quizStarted.value = true
  currentQuestionIndex.value = 0
  answers.value = []
  selectedAnswer.value = null
}

const selectAnswer = (answer: any) => {
  selectedAnswer.value = answer
  // Store both answer and freeResponseText for each question
  answers.value[currentQuestionIndex.value] = {
    answer,
    freeResponseText: isDependsAnswer(answer) ? freeResponseText.value : ''
  }
  if (!isDependsAnswer(answer)) {
    freeResponseText.value = ''
  }
}

function isDependsAnswer(answer: any) {
  return (
    answer.text.toLowerCase().includes('depends') ||
    answer.value === 'depends' ||
    answer.value === 'mood' ||
    answer.value === 'seasonal'
  )
}

const nextQuestion = async () => {
  if (!selectedAnswer.value) return
  // If free response, require text
  if (isDependsAnswer(selectedAnswer.value) && !freeResponseText.value.trim()) return

  // Save the answer object
  answers.value[currentQuestionIndex.value] = {
    answer: selectedAnswer.value,
    freeResponseText: isDependsAnswer(selectedAnswer.value) ? freeResponseText.value.trim() : ''
  }

  if (isLastQuestion.value) {
    // Complete the quiz and generate hobby match
    loading.value = true
    quizCompleted.value = true

    // Print responses to console for debugging
    console.log('Quiz responses being passed in:', JSON.parse(JSON.stringify(answers.value)))

    // Generate hobby match with all answers
    if (authStore.user) {
      await generateHobbyMatch()
    }
    loading.value = false
  } else {
    // Move to next question
    currentQuestionIndex.value++
    // Restore answer and free response for next question if available
    const next = answers.value[currentQuestionIndex.value]
    selectedAnswer.value = next ? next.answer : null
    freeResponseText.value = next && next.freeResponseText ? next.freeResponseText : ''
  }
}
const canProceedToNext = computed(() => {
  if (!selectedAnswer.value) return false
  if (isDependsAnswer(selectedAnswer.value)) {
    return !!freeResponseText.value.trim()
  }
  return true
})

const previousQuestion = () => {
  if (currentQuestionIndex.value > 0) {
    currentQuestionIndex.value--
    const prev = answers.value[currentQuestionIndex.value]
    selectedAnswer.value = prev ? prev.answer : null
    freeResponseText.value = prev && prev.freeResponseText ? prev.freeResponseText : ''
  }
}

const generateHobbyMatch = async () => {
  if (!authStore.user) return

  const params = {
    user: authStore.user.id,
    answers: answers.value,
  }
  console.log('generateHobbyMatch parameters:', params)
  loadingMatch.value = true
  try {
    const response = await ApiService.callConceptAction<{ matchedHobby: string }>(
      'QuizMatchmaker',
      'generateHobbyMatch',
      params,
    )

    if ('matchedHobby' in response) {
      hobbyMatch.value = response.matchedHobby
    }
  } catch (error: any) {
    console.error('Failed to generate hobby match:', error)
  } finally {
    loadingMatch.value = false
  }
}

const addHobbyToProfile = async () => {
  if (!hobbyMatch.value || !authStore.user) return

  // Check if hobby already exists in user's hobby list
  if (profileStore.hobbies.includes(hobbyMatch.value)) {
    alert('You already have this hobby in your list!')
    return
  }

  try {
    await profileStore.setHobby(hobbyMatch.value)
    alert(
      `${hobbyMatch.value} has been added to your hobbies! Now you can create goals for it in the Milestones section.`,
    )
    router.push('/dashboard/milestones')
  } catch (error: any) {
    console.error('Failed to add hobby to profile:', error)
    alert('Failed to add hobby to profile. Please try again.')
  }
}

const retakeQuiz = async () => {
  quizStarted.value = false
  quizCompleted.value = false
  currentQuestionIndex.value = 0
  answers.value = []
  selectedAnswer.value = null
  hobbyMatch.value = null
  loadingMatch.value = false
}

onMounted(() => {
  // Check if user has existing quiz results
  const existingResults = localStorage.getItem('quizResults')
  if (existingResults) {
    // Could show option to view previous results
  }
})
</script>

<style scoped>
.quiz-view {
  max-width: 800px;
  margin: 0 auto;
  padding: 2rem;
  position: relative;
}

.quiz-header {
  text-align: center;
  margin-bottom: 3rem;
}

.quiz-header h1 {
  margin: 0 0 1rem 0;
  color: #333;
  font-size: 2.5rem;
  font-weight: 500;
  background: #256b28;
  -webkit-background-clip: text;
  background-clip: text;
  -webkit-text-fill-color: transparent;
}

.quiz-description {
  color: #666;
  font-size: 1.1rem;
  line-height: 1.6;
  margin: 0;
}

.intro-card {
  background: #e8f5e9;
  border-radius: 16px;
  padding: 3rem;
  text-align: center;
}

.intro-card h2 {
  margin: 0 0 1rem 0;
  color: #333;
  font-size: 1.8rem;
}

.intro-card p {
  color: #666;
  font-size: 1.1rem;
  line-height: 1.6;
  margin-bottom: 2rem;
}

.quiz-features {
  list-style: none;
  padding: 0;
  margin: 2rem 0;
  display: grid;
  gap: 1rem;
}

.quiz-features li {
  color: #555;
  font-size: 1rem;
  padding: 0.5rem;
}

.start-quiz-button {
  background: #388e3c;
  color: white;
  border: none;
  padding: 1rem 3rem;
  border-radius: 50px;
  font-size: 1.1rem;
  font-weight: 600;
  cursor: pointer;
  transition: transform 0.2s;
}

.start-quiz-button:hover {
  background: #256b28;
}

.quiz-content {
  background: white;
  border-radius: 16px;
  overflow: hidden;
}

.progress-section {
  padding: 2rem 2rem 1rem 2rem;
  border-bottom: 1px solid #e9ecef;
}

.progress-bar {
  height: 8px;
  background: #e9ecef;
  border-radius: 4px;
  overflow: hidden;
  margin-bottom: 1rem;
}

.progress-fill {
  height: 100%;
  background: linear-gradient(90deg, #81c784, #388e3c);
  border-radius: 4px;
  transition: width 0.3s ease;
}

.progress-text {
  color: #666;
  font-size: 0.9rem;
  font-weight: 500;
}

.question-card {
  padding: 3rem 2rem;
}

.question-text {
  margin: 0 0 2rem 0;
  color: #333;
  font-size: 1.5rem;
  line-height: 1.4;
  text-align: center;
}

.answers-grid {
  display: grid;
  gap: 1rem;
  margin-bottom: 3rem;
}

.answer-button {
  background: white;
  border: 2px solid #e9ecef;
  padding: 1.5rem;
  border-radius: 12px;
  font-size: 1rem;
  cursor: pointer;
  transition: all 0.2s;
  text-align: left;
  color: #333;
}

.answer-button:hover {
  border-color: #388e3c;
  background: #f8f9ff;
}

.answer-button.selected {
  border-color: #388e3c;
  background: linear-gradient(135deg, #81c784 0%, #388e3c 100%);
  color: white;
}

.question-actions {
  display: flex;
  justify-content: space-between;
  gap: 1rem;
}

.nav-button {
  padding: 0.75rem 1.5rem;
  border-radius: 8px;
  font-size: 1rem;
  cursor: pointer;
  transition: all 0.2s;
  border: none;
}

.prev-button {
  background: #f8f9fa;
  color: #666;
}

.prev-button:hover:not(:disabled) {
  background: #e9ecef;
}

.prev-button:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.next-button {
  background: #388e3c;
  color: white;
}

.next-button:hover:not(:disabled) {
  background: #256b28;
}

.next-button:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.quiz-results {
  text-align: center;
  background: white;
  border-radius: 16px;
  padding: 3rem;
}

.results-header h2 {
  margin: 0 0 1rem 0;
  color: #333;
  font-size: 2rem;
}

.results-header p {
  color: #666;
  font-size: 1.1rem;
  line-height: 1.6;
  margin-bottom: 2rem;
}

.results-actions {
  display: flex;
  justify-content: center;
  gap: 1rem;
  flex-wrap: wrap;
}

.view-recommendations-button {
  background: linear-gradient(135deg, #667eea, #764ba2);
  color: white;
  border: none;
  padding: 1rem 2rem;
  border-radius: 50px;
  font-size: 1rem;
  font-weight: 600;
  cursor: pointer;
  transition: transform 0.2s;
}

.retake-button {
  background: transparent;
  color: #388e3c;
  border: 2px solid #388e3c;
  padding: 1rem 2rem;
  border-radius: 50px;
  font-size: 1rem;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s;
}

.retake-button:hover {
  background: #388e3c;
  color: white;
}

.loading-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(255, 255, 255, 0.9);
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  z-index: 1000;
}

.loading-spinner {
  width: 50px;
  height: 50px;
  border: 4px solid #e9ecef;
  border-top: 4px solid #388e3c;
  border-radius: 50%;
  animation: spin 1s linear infinite;
  margin-bottom: 1rem;
}

@keyframes spin {
  0% {
    transform: rotate(0deg);
  }
  100% {
    transform: rotate(360deg);
  }
}

.loading-overlay p {
  color: #666;
  font-size: 1.1rem;
}

.loading-match {
  text-align: center;
  padding: 2rem;
}

.loading-match .loading-spinner {
  width: 40px;
  height: 40px;
  border: 3px solid #e9ecef;
  border-top: 3px solid #388e3c;
  border-radius: 50%;
  animation: spin 1s linear infinite;
  margin: 0 auto 1rem auto;
}

.hobby-recommendation {
  text-align: center;
}

.hobby-match-card {
  background: linear-gradient(135deg, #f8f9ff, #ffffff);
  border: 2px solid #667eea;
  border-radius: 16px;
  padding: 2rem;
  margin: 1rem 0;
}

.hobby-match-card h4 {
  font-size: 1.8rem;
  color: #667eea;
  margin: 0 0 1rem 0;
  font-weight: 600;
}

.hobby-match-card p {
  color: #666;
  margin-bottom: 2rem;
  line-height: 1.6;
}

.action-buttons {
  display: flex;
  gap: 1rem;
  justify-content: center;
  flex-wrap: wrap;
}

.add-hobby-btn {
  background: #388e3c;
  color: white;
  border: none;
  padding: 1rem 2rem;
  border-radius: 50px;
  font-size: 1rem;
  font-weight: 600;
  cursor: pointer;
  transition: transform 0.2s;
}

.add-hobby-btn:hover {
  background: #256b28;
}

.retake-btn {
  background: linear-gradient(135deg, #ffffff, #f8fff8);
  color: #388e3c;
  border: 2px solid #388e3c;
  padding: 1rem 2rem;
  border-radius: 50px;
  font-size: 1rem;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s;
}

.retake-btn:hover {
  background: #388e3c;
  color: white;
}

.no-match {
  text-align: center;
  padding: 2rem;
}

.no-match p {
  color: #666;
  margin-bottom: 1rem;
}

.free-response-option {
  display: flex;
  flex-direction: column;
  align-items: stretch;
  width: 100%;
}
.free-response-textarea {
  width: 100%;
  margin-top: 0.5rem;
  padding: 1rem;
  border-radius: 8px;
  border: 1.5px solid #81c784;
  font-size: 1rem;
  resize: vertical;
  min-height: 60px;
  box-sizing: border-box;
  background: #f8f9ff;
  color: #333;
  transition: border-color 0.2s;
}
.free-response-textarea:focus {
  outline: none;
  border-color: #388e3c;
  background: #fff;
}

@media (max-width: 768px) {
  .quiz-view {
    padding: 1rem;
  }

  .intro-card,
  .question-card {
    padding: 2rem 1.5rem;
  }

  .quiz-header h1 {
    font-size: 2rem;
  }

  .question-actions {
    flex-direction: column;
  }

  .results-actions {
    flex-direction: column;
  }
}
</style>
