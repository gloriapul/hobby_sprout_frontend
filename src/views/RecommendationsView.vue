<!-- This file is deprecated. The quiz now returns only one hobby at a time. All recommendations logic is handled in QuizView.vue. -->
          <p class="hobby-description">{{ recommendation.description }}</p>

          <div class="hobby-details">
            <div class="detail-item">
              <span class="detail-label">Difficulty:</span>
              <div class="difficulty-stars">
                <span
                  v-for="i in 5"
                  :key="i"
                  class="star"
                  :class="{ filled: i <= recommendation.difficulty }"
                >
                  ★
                </span>
              </div>
            </div>

            <div class="detail-item">
              <span class="detail-label">Time Commitment:</span>
              <span class="detail-value">{{ recommendation.timeCommitment }}</span>
            </div>

            <div class="detail-item">
              <span class="detail-label">Cost:</span>
              <span class="detail-value">{{ recommendation.cost }}</span>
            </div>
          </div>

          <div class="hobby-tags">
            <span v-for="tag in recommendation.tags" :key="tag" class="hobby-tag">
              {{ tag }}
            </span>
          </div>

          <div class="card-actions">
            <button
              @click="addToHobbies(recommendation)"
              class="add-hobby-button"
              :disabled="isHobbyAdded(recommendation.name)"
            >
              {{ isHobbyAdded(recommendation.name) ? '✓ Added' : '+ Add to My Hobbies' }}
            </button>
            <button @click="learnMore(recommendation)" class="learn-more-button">Learn More</button>
          </div>
        </div>
      </div>

      <div class="recommendations-actions">
        <button @click="retakeQuiz" class="retake-quiz-button">🔄 Retake Quiz</button>
        <button @click="saveRecommendations" class="save-button">💾 Save Recommendations</button>
      </div>
    </div>

    <div v-else class="no-recommendations">
      <div class="no-recommendations-content">
        <h2>No recommendations yet</h2>
        <p>Take the personality quiz to get personalized hobby recommendations!</p>
        <button @click="goToQuiz" class="take-quiz-button">Take Quiz</button>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { useProfileStore } from '@/stores/profile'

const router = useRouter()
const profileStore = useProfileStore()

const loading = ref(false)
const recommendations = ref<any[]>([])
const personalityTraits = ref<string[]>([])

// Sample recommendations (in a real app, these would come from QuizMatchmaker concept)
const sampleRecommendations = [
  {
    id: 1,
    name: 'Photography',
    description:
      'Capture beautiful moments and express your creativity through the lens. Perfect for those who love visual arts and exploring new places.',
    icon: '📸',
    matchScore: 95,
    difficulty: 3,
    timeCommitment: '1-3 hours/week',
    cost: 'Medium',
    tags: ['Creative', 'Visual', 'Outdoor', 'Technical'],
    featured: true,
  },
  {
    id: 2,
    name: 'Rock Climbing',
    description:
      'Challenge yourself physically and mentally while building strength and problem-solving skills. Great for adventure seekers.',
    icon: '🧗‍♀️',
    matchScore: 88,
    difficulty: 4,
    timeCommitment: '2-4 hours/week',
    cost: 'Medium-High',
    tags: ['Physical', 'Outdoor', 'Challenge', 'Social'],
  },
  {
    id: 3,
    name: 'Pottery',
    description:
      'Create beautiful, functional art with your hands. Relaxing and meditative while developing artistic skills.',
    icon: '🏺',
    matchScore: 82,
    difficulty: 3,
    timeCommitment: '2-3 hours/week',
    cost: 'Medium',
    tags: ['Creative', 'Hands-on', 'Relaxing', 'Artistic'],
  },
  {
    id: 4,
    name: 'Cooking',
    description:
      'Explore flavors from around the world and create delicious meals. Practical skill that brings joy to daily life.',
    icon: '👨‍🍳',
    matchScore: 79,
    difficulty: 2,
    timeCommitment: '3-5 hours/week',
    cost: 'Low-Medium',
    tags: ['Practical', 'Creative', 'Social', 'Cultural'],
  },
  {
    id: 5,
    name: 'Gardening',
    description:
      'Grow your own plants, flowers, or vegetables. Connect with nature and enjoy the satisfaction of nurturing life.',
    icon: '🌱',
    matchScore: 75,
    difficulty: 2,
    timeCommitment: '1-4 hours/week',
    cost: 'Low',
    tags: ['Nature', 'Peaceful', 'Practical', 'Seasonal'],
  },
  {
    id: 6,
    name: 'Board Games',
    description:
      'Engage in strategic thinking and social interaction. Perfect for those who love mental challenges and gathering with friends.',
    icon: '🎲',
    matchScore: 71,
    difficulty: 2,
    timeCommitment: '2-4 hours/week',
    cost: 'Low-Medium',
    tags: ['Social', 'Strategic', 'Indoor', 'Mental'],
  },
]

const userHobbies = computed(() => profileStore.hobbies || [])

const isHobbyAdded = (hobbyName: string) => {
  return userHobbies.value.some((hobby) => hobby.name.toLowerCase() === hobbyName.toLowerCase())
}

const generateRecommendations = async () => {
  loading.value = true

  try {
    // Simulate API call to QuizMatchmaker concept
    await new Promise((resolve) => setTimeout(resolve, 1500))

    // Get quiz results from localStorage (set in QuizView)
    const quizResults = localStorage.getItem('quizResults')

    if (quizResults) {
      const answers = JSON.parse(quizResults)

      // Generate personality traits based on answers
      personalityTraits.value = generatePersonalityTraits(answers)

      // Filter and sort recommendations based on quiz results
      recommendations.value = sampleRecommendations
        .map((rec) => ({
          ...rec,
          matchScore: calculateMatchScore(answers, rec),
        }))
        .sort((a, b) => b.matchScore - a.matchScore)
        .slice(0, 6) // Show top 6 recommendations
    } else {
      // Default recommendations if no quiz taken
      recommendations.value = sampleRecommendations.slice(0, 6)
      personalityTraits.value = ['Creative', 'Adventurous', 'Social']
    }
  } finally {
    loading.value = false
  }
}

const generatePersonalityTraits = (answers: any[]) => {
  const traits = new Set<string>()

  answers.forEach((answer) => {
    switch (answer.value) {
      case 'outdoor_active':
      case 'outdoor_sports':
        traits.add('Outdoor Enthusiast')
        break
      case 'indoor_creative':
      case 'artistic':
      case 'crafting':
        traits.add('Creative')
        break
      case 'learning':
      case 'reading':
      case 'intellectual':
        traits.add('Lifelong Learner')
        break
      case 'social':
      case 'large_group':
        traits.add('Social')
        break
      case 'physical':
        traits.add('Active')
        break
      case 'mental':
        traits.add('Analytical')
        break
      case 'helping':
        traits.add('Caring')
        break
      case 'practical':
        traits.add('Practical')
        break
    }
  })

  return Array.from(traits).slice(0, 4)
}

const calculateMatchScore = (answers: any[], recommendation: any) => {
  // Simple matching algorithm based on tags and answers
  let score = 70 // Base score

  answers.forEach((answer) => {
    if (
      recommendation.tags.some(
        (tag: string) =>
          tag.toLowerCase().includes(answer.value.split('_')[0]) ||
          answer.value.includes(tag.toLowerCase()),
      )
    ) {
      score += 5
    }
  })

  return Math.min(Math.max(score, 60), 98) // Keep between 60-98%
}

const addToHobbies = async (recommendation: any) => {
  if (isHobbyAdded(recommendation.name)) return

  await profileStore.addHobby({
    name: recommendation.name,
    description: recommendation.description,
  })
}

const learnMore = (recommendation: any) => {
  // In a real app, this could open a detailed view or external links
  alert(
    `Learn more about ${recommendation.name}:\n\n${recommendation.description}\n\nDifficulty: ${recommendation.difficulty}/5 stars\nTime: ${recommendation.timeCommitment}\nCost: ${recommendation.cost}`,
  )
}

const retakeQuiz = () => {
  router.push('/dashboard/quiz')
}

const saveRecommendations = () => {
  localStorage.setItem('savedRecommendations', JSON.stringify(recommendations.value))
  alert('Recommendations saved! You can view them anytime from your profile.')
}

const goToQuiz = () => {
  router.push('/dashboard/quiz')
}

onMounted(() => {
  generateRecommendations()
})
</script>

<style scoped>
.recommendations-view {
  width: 100%;
  padding: 2rem;
}

.recommendations-header {
  text-align: center;
  margin-bottom: 3rem;
}

.recommendations-header h1 {
  margin: 0 0 1rem 0;
  color: #333;
  font-size: 2.5rem;
  background: linear-gradient(135deg, #667eea, #764ba2);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
}

.header-description {
  color: #666;
  font-size: 1.1rem;
  line-height: 1.6;
  margin: 0;
}

.loading-state {
  text-align: center;
  padding: 4rem 2rem;
}

.loading-spinner {
  width: 50px;
  height: 50px;
  border: 4px solid #e9ecef;
  border-top: 4px solid #667eea;
  border-radius: 50%;
  animation: spin 1s linear infinite;
  margin: 0 auto 1rem auto;
}

@keyframes spin {
  0% {
    transform: rotate(0deg);
  }
  100% {
    transform: rotate(360deg);
  }
}

.loading-state p {
  color: #666;
  font-size: 1.1rem;
}

.quiz-summary {
  background: white;
  border-radius: 12px;
  padding: 2rem;
  margin-bottom: 3rem;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
}

.quiz-summary h2 {
  margin: 0 0 1rem 0;
  color: #333;
  font-size: 1.5rem;
}

.profile-traits {
  display: flex;
  flex-wrap: wrap;
  gap: 0.5rem;
}

.trait-tag {
  background: linear-gradient(135deg, #667eea, #764ba2);
  color: white;
  padding: 0.5rem 1rem;
  border-radius: 20px;
  font-size: 0.9rem;
  font-weight: 500;
}

.recommendations-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(350px, 1fr));
  gap: 2rem;
  margin-bottom: 3rem;
}

.recommendation-card {
  background: white;
  border-radius: 16px;
  padding: 2rem;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
  transition:
    transform 0.2s,
    box-shadow 0.2s;
  border: 2px solid transparent;
}

.recommendation-card:hover {
  transform: translateY(-4px);
  box-shadow: 0 8px 24px rgba(0, 0, 0, 0.15);
}

.recommendation-card.featured {
  border-color: #667eea;
  background: linear-gradient(135deg, #f8f9ff, #ffffff);
}

.card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 1rem;
}

.hobby-icon {
  font-size: 2.5rem;
}

.match-score {
  text-align: right;
}

.score {
  display: block;
  font-size: 1.5rem;
  font-weight: bold;
  color: #667eea;
}

.match-label {
  font-size: 0.8rem;
  color: #666;
  text-transform: uppercase;
  letter-spacing: 0.5px;
}

.hobby-name {
  margin: 0 0 1rem 0;
  color: #333;
  font-size: 1.5rem;
  font-weight: 600;
}

.hobby-description {
  color: #666;
  line-height: 1.6;
  margin-bottom: 1.5rem;
}

.hobby-details {
  margin-bottom: 1.5rem;
}

.detail-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 0.5rem;
}

.detail-label {
  font-weight: 500;
  color: #555;
  font-size: 0.9rem;
}

.detail-value {
  color: #333;
  font-size: 0.9rem;
}

.difficulty-stars {
  color: #ffc107;
}

.star {
  font-size: 1rem;
}

.star.filled {
  color: #ffc107;
}

.star:not(.filled) {
  color: #e9ecef;
}

.hobby-tags {
  display: flex;
  flex-wrap: wrap;
  gap: 0.5rem;
  margin-bottom: 1.5rem;
}

.hobby-tag {
  background: #f8f9fa;
  color: #555;
  padding: 0.25rem 0.75rem;
  border-radius: 12px;
  font-size: 0.8rem;
  border: 1px solid #e9ecef;
}

.card-actions {
  display: flex;
  gap: 0.5rem;
  flex-wrap: wrap;
}

.add-hobby-button {
  flex: 1;
  background: linear-gradient(135deg, #667eea, #764ba2);
  color: white;
  border: none;
  padding: 0.75rem 1rem;
  border-radius: 8px;
  font-size: 0.9rem;
  cursor: pointer;
  transition: opacity 0.2s;
}

.add-hobby-button:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

.learn-more-button {
  background: transparent;
  color: #667eea;
  border: 2px solid #667eea;
  padding: 0.75rem 1rem;
  border-radius: 8px;
  font-size: 0.9rem;
  cursor: pointer;
  transition: all 0.2s;
}

.learn-more-button:hover {
  background: #667eea;
  color: white;
}

.recommendations-actions {
  display: flex;
  justify-content: center;
  gap: 1rem;
  flex-wrap: wrap;
}

.retake-quiz-button,
.save-button,
.dashboard-button {
  padding: 1rem 2rem;
  border-radius: 50px;
  font-size: 1rem;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s;
  border: none;
}

.retake-quiz-button {
  background: #f8f9fa;
  color: #667eea;
  border: 2px solid #667eea;
}

.retake-quiz-button:hover {
  background: #667eea;
  color: white;
}

.save-button {
  background: #28a745;
  color: white;
}

.save-button:hover {
  background: #218838;
}

.dashboard-button {
  background: linear-gradient(135deg, #667eea, #764ba2);
  color: white;
}

.dashboard-button:hover {
  transform: translateY(-2px);
}

.no-recommendations {
  text-align: center;
  padding: 4rem 2rem;
}

.no-recommendations-content {
  background: white;
  border-radius: 16px;
  padding: 3rem;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
  max-width: 500px;
  margin: 0 auto;
}

.no-recommendations-content h2 {
  margin: 0 0 1rem 0;
  color: #333;
  font-size: 1.8rem;
}

.no-recommendations-content p {
  color: #666;
  font-size: 1.1rem;
  line-height: 1.6;
  margin-bottom: 2rem;
}

.take-quiz-button {
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

.take-quiz-button:hover {
  transform: translateY(-2px);
}

@media (max-width: 768px) {
  .recommendations-view {
    padding: 1rem;
  }

  .recommendations-grid {
    grid-template-columns: 1fr;
  }

  .recommendation-card {
    padding: 1.5rem;
  }

  .card-actions {
    flex-direction: column;
  }

  .recommendations-actions {
    flex-direction: column;
  }

  .quiz-summary {
    padding: 1.5rem;
  }
}
</style>
