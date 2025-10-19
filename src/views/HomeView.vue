<template>
  <div class="home-view">
    <div class="hero-section">
      <div class="hero-content">
        <div class="hero-text">
          <h1 class="hero-title">
            <span class="title-main">Hobby</span>
            <span class="title-accent">Sprout</span>
          </h1>
          <p class="hero-subtitle">
            Discover, track, and grow your passions with personalized hobby recommendations and
            milestone tracking.
          </p>
          <div class="hero-buttons">
            <button @click="goToRegister" class="cta-button primary">Get Started</button>
            <button @click="goToLogin" class="cta-button secondary">Sign In</button>
          </div>
        </div>
        <div class="hero-visual">
          <div class="hobby-icons">
            <div class="icon-item">📸</div>
            <div class="icon-item">🎨</div>
            <div class="icon-item">🧗‍♀️</div>
            <div class="icon-item">🌱</div>
            <div class="icon-item">🍳</div>
            <div class="icon-item">📚</div>
            <div class="icon-item">🎵</div>
            <div class="icon-item">✈️</div>
          </div>
        </div>
      </div>
    </div>

    <div class="features-section">
      <div class="container">
        <h2 class="section-title">Everything you need to grow your hobbies</h2>
        <div class="features-grid">
          <div class="feature-card">
            <div class="feature-icon">🎯</div>
            <h3>Personalized Recommendations</h3>
            <p>
              Take our personality quiz to discover hobbies that match your interests and lifestyle.
            </p>
          </div>
          <div class="feature-card">
            <div class="feature-icon">📊</div>
            <h3>Track Your Progress</h3>
            <p>Set goals, create milestones, and track your journey as you develop new skills.</p>
          </div>
          <div class="feature-card">
            <div class="feature-icon">👤</div>
            <h3>Personal Dashboard</h3>
            <p>
              Manage all your hobbies, goals, and achievements in one beautiful, organized space.
            </p>
          </div>
          <div class="feature-card">
            <div class="feature-icon">🚀</div>
            <h3>Step-by-Step Guidance</h3>
            <p>Break down complex skills into manageable steps with AI-powered recommendations.</p>
          </div>
        </div>
      </div>
    </div>

    <div class="how-it-works-section">
      <div class="container">
        <h2 class="section-title">How it works</h2>
        <div class="steps-grid">
          <div class="step-item">
            <div class="step-number">1</div>
            <h3>Take the Quiz</h3>
            <p>Answer questions about your preferences, interests, and personality.</p>
          </div>
          <div class="step-item">
            <div class="step-number">2</div>
            <h3>Get Recommendations</h3>
            <p>Receive personalized hobby suggestions tailored to your unique profile.</p>
          </div>
          <div class="step-item">
            <div class="step-number">3</div>
            <h3>Set Goals</h3>
            <p>Create specific, achievable goals for your chosen hobbies.</p>
          </div>
          <div class="step-item">
            <div class="step-number">4</div>
            <h3>Track Progress</h3>
            <p>Monitor your journey and celebrate your achievements along the way.</p>
          </div>
        </div>
      </div>
    </div>

    <div class="cta-section">
      <div class="container">
        <div class="cta-content">
          <h2>Ready to discover your next passion?</h2>
          <p>Join thousands of hobby enthusiasts who are already growing with Hobby Sprout.</p>
          <button @click="goToRegister" class="cta-button primary large">
            Start Your Journey Today
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { useRouter } from 'vue-router'
import { useAuthStore } from '@/stores/auth'
import { onMounted } from 'vue'

const router = useRouter()
const authStore = useAuthStore()

const goToLogin = () => {
  router.push('/login')
}

const goToRegister = () => {
  router.push('/register')
}

// If user is already logged in, redirect to dashboard
onMounted(() => {
  if (authStore.isAuthenticated) {
    router.push('/dashboard')
  }
})
</script>

<style scoped>
.home-view {
  min-height: 100vh;
}

.hero-section {
  background: linear-gradient(135deg, #e8f5e9 0%, #c8e6c9 60%, #a5d6a7 100%);
  color: #388e3c;
  padding: 4rem 2rem;
  min-height: 80vh;
  display: flex;
  align-items: center;
}

.hero-content {
  max-width: 1200px;
  margin: 0 auto;
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 4rem;
  align-items: center;
  background: rgba(232, 245, 233, 0.85);
  border-radius: 32px;
  box-shadow: 0 4px 24px rgba(56, 142, 60, 0.07);
  padding: 2rem;
}

.hero-title {
  font-size: 4rem;
  font-weight: 800;
  margin: 0 0 1.5rem 0;
  line-height: 1.1;
}

.title-main {
  display: block;
}

.title-accent {
  background: linear-gradient(45deg, #a5d6a7, #388e3c);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  display: block;
}

.hero-subtitle {
  font-size: 1.3rem;
  line-height: 1.6;
  margin-bottom: 2.5rem;
  opacity: 0.9;
}

.hero-buttons {
  display: flex;
  gap: 1rem;
  flex-wrap: wrap;
}

.cta-button {
  padding: 1rem 2rem;
  border-radius: 50px;
  font-size: 1.1rem;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s;
  border: none;
  text-decoration: none;
  display: inline-block;
}

.cta-button.primary {
  background: linear-gradient(135deg, #81c784 0%, #388e3c 100%);
  color: white;
}

.cta-button.primary:hover {
  transform: translateY(-2px);
  box-shadow: 0 8px 25px rgba(56, 142, 60, 0.15);
}

.cta-button.secondary {
  background: transparent;
  color: #388e3c;
  border: 2px solid #388e3c;
}

.cta-button.secondary:hover {
  background: #388e3c;
  color: white;
}

.cta-button.large {
  padding: 1.2rem 2.5rem;
  font-size: 1.2rem;
}

.hero-visual {
  display: flex;
  justify-content: center;
  align-items: center;
}

.hobby-icons {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 1.5rem;
  opacity: 0.9;
}

.icon-item {
  font-size: 3rem;
  background: rgba(255, 255, 255, 0.1);
  border-radius: 20px;
  padding: 1.5rem;
  text-align: center;
  backdrop-filter: blur(10px);
  border: 1px solid rgba(255, 255, 255, 0.2);
  transition: transform 0.3s;
}

.icon-item:hover {
  transform: scale(1.1);
}

.container {
  max-width: 1200px;
  margin: 0 auto;
  padding: 0 2rem;
}

.features-section,
.how-it-works-section {
  padding: 5rem 0;
  background: #f8f9fa;
}

.how-it-works-section {
  background: white;
}

.section-title {
  text-align: center;
  font-size: 2.5rem;
  font-weight: 700;
  margin-bottom: 3rem;
  color: #333;
}

.features-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
  gap: 2rem;
}

.feature-card {
  background: white;
  padding: 2.5rem;
  border-radius: 20px;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.1);
  text-align: center;
  transition: transform 0.3s;
}

.feature-card:hover {
  transform: translateY(-5px);
}

.feature-icon {
  font-size: 3rem;
  margin-bottom: 1.5rem;
}

.feature-card h3 {
  font-size: 1.3rem;
  font-weight: 600;
  margin-bottom: 1rem;
  color: #333;
}

.feature-card p {
  color: #666;
  line-height: 1.6;
}

.steps-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
  gap: 2rem;
}

.step-item {
  text-align: center;
  padding: 2rem;
}

.step-number {
  width: 60px;
  height: 60px;
  background: linear-gradient(135deg, #a5d6a7, #388e3c);
  color: white;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 1.5rem;
  font-weight: bold;
  margin: 0 auto 1.5rem auto;
}

.step-item h3 {
  font-size: 1.3rem;
  font-weight: 600;
  margin-bottom: 1rem;
  color: #333;
}

.step-item p {
  color: #666;
  line-height: 1.6;
}

.cta-section {
  background: linear-gradient(135deg, #e8f5e9 0%, #a5d6a7 100%);
  color: #388e3c;
  padding: 5rem 0;
  text-align: center;
}

.cta-content h2 {
  font-size: 2.5rem;
  font-weight: 700;
  margin-bottom: 1rem;
}

.cta-content p {
  font-size: 1.2rem;
  margin-bottom: 2.5rem;
  opacity: 0.9;
}

@media (max-width: 768px) {
  .hero-content {
    grid-template-columns: 1fr;
    gap: 2rem;
    text-align: center;
  }

  .hero-title {
    font-size: 2.5rem;
  }

  .hero-subtitle {
    font-size: 1.1rem;
  }

  .hobby-icons {
    grid-template-columns: repeat(4, 1fr);
    gap: 1rem;
  }

  .icon-item {
    font-size: 2rem;
    padding: 1rem;
  }

  .features-grid,
  .steps-grid {
    grid-template-columns: 1fr;
  }

  .section-title {
    font-size: 2rem;
  }

  .cta-content h2 {
    font-size: 2rem;
  }

  .hero-buttons {
    justify-content: center;
  }
}

@media (max-width: 480px) {
  .hero-section {
    padding: 2rem 1rem;
  }

  .container {
    padding: 0 1rem;
  }

  .hero-title {
    font-size: 2rem;
  }

  .hobby-icons {
    grid-template-columns: repeat(3, 1fr);
  }
}
</style>
