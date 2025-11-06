<template>
  <div class="home-view">
    <div class="hero-section">
      <div class="hero-content">
        <div class="hero-text">
          <div class="logo-container">
            <img src="/HobbySproutLogo.png" alt="HobbySprout Logo" class="hero-logo" />
          </div>
          <h1 class="hero-title">
            <span class="title-main">HobbySprout</span>
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
              Take our personality quiz to discover a hobby that matches your interests and
              lifestyle.
            </p>
          </div>
          <div class="feature-card">
            <div class="feature-icon">📊</div>
            <h3>Track Your Progress</h3>
            <p>Set goals, create milestones, and track your journey as you work on your hobbies.</p>
          </div>
        </div>
      </div>
    </div>

    <div class="how-it-works-section">
      <div class="container">
        <h2 class="section-title">How it works</h2>
        <div class="steps-grid">
          <div class="feature-card step-item">
            <div class="step-number">1</div>
            <h3>Take the Quiz</h3>
            <p>Answer questions about your preferences, interests, and personality.</p>
          </div>
          <div class="feature-card step-item">
            <div class="step-number">2</div>
            <h3>Get a Recommendation</h3>
            <p>Receive a personalized hobby suggestion tailored to your unique profile.</p>
          </div>
          <div class="feature-card step-item">
            <div class="step-number">3</div>
            <h3>Set Goals</h3>
            <p>Create specific, achievable goals for your chosen hobbies.</p>
          </div>
          <div class="feature-card step-item">
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
          <p>
            Whether you are already certain of the hobby you want to work on or are looking for a
            suggestion from our quiz, you will find the perfect path to growth here.
          </p>
          <button @click="scrollToTop" class="cta-button primary large">
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

function scrollToTop() {
  window.scrollTo({ top: 0, behavior: 'smooth' })
}

// If user is already logged in, redirect to dashboard
onMounted(() => {
  if (authStore.isAuthenticated) {
    router.push('/dashboard')
  }
})
</script>

<style scoped>
@import '@/assets/fonts/floras-display.css';

.home-view {
  min-height: 100vh;
  font-weight: 400;
}

.logo-container {
  display: flex;
  justify-content: flex-start;
  align-items: center;
  margin-bottom: 1.5rem;
}
.hero-logo {
  height: 150px;
  width: auto;
  margin-right: 1rem;
  border-radius: 16px;
}

.hero-section {
  background: #bce7bd;
  color: #187c1d;
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
  padding: 2rem;
}

.hero-title {
  font-size: 4rem;
  font-weight: 800;
  line-height: 1.1;
  font-family: 'Floras Display', sans-serif !important;
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
  background: #388e3c;
  color: white;
  transition:
    background 0.2s,
    color 0.2s;
}

.cta-button.primary:hover {
  background: #256b28;
  color: white;
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
  background: #fff;
}

.section-title {
  text-align: center;
  font-size: 2.5rem;
  font-weight: 600;
  margin-bottom: 3rem;
  color: #256b28;
}

.features-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
  gap: 2rem;
}

.feature-card,
.step-item {
  background: #e8f5e9;
  padding: 2.5rem;
  border-radius: 20px;
  text-align: center;
  transition: transform 0.3s;
}

.feature-icon {
  font-size: 3rem;
  margin-bottom: 1.5rem;
}

.feature-card h3,
.step-item h3 {
  font-size: 1.3rem;
  margin-bottom: 1rem;
  color: #256b28;
  font-weight: 500;
}

.feature-card p,
.step-item p {
  color: #666;
  line-height: 1.6;
}

.steps-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
  gap: 2rem;
}

.step-number {
  width: 60px;
  height: 60px;
  background: #388e3c;
  color: white;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 1.5rem;
  font-weight: bold;
  margin: 0 auto 1.5rem auto;
}

.cta-section {
  background: #bce7bd;
  color: #256b28;
  padding: 5rem 0;
  text-align: center;
}

.cta-content h2 {
  font-size: 2.5rem;
  margin-bottom: 1rem;
  font-weight: 600;
}

.cta-content p {
  font-size: 1.2rem;
  margin-bottom: 2.5rem;
  opacity: 0.9;
}
</style>
