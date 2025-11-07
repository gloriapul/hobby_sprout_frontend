import { createRouter, createWebHistory } from 'vue-router'
import { useAuthStore } from '@/stores/auth'
import HomeView from '../views/HomeView.vue'

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    {
      path: '/',
      name: 'home',
      component: HomeView,
    },
    {
      path: '/login',
      name: 'login',
      component: () => import('../views/LoginView.vue'),
      meta: { requiresGuest: true },
    },
    {
      path: '/register',
      name: 'register',
      component: () => import('../views/RegisterView.vue'),
      meta: { requiresGuest: true },
    },
    {
      path: '/dashboard',
      component: () => import('../views/DashboardView.vue'),
      meta: { requiresAuth: true },
      children: [
        {
          path: '',
          name: 'dashboard',
          component: () => import('../views/DashboardOverview.vue'),
        },
        {
          path: 'profile',
          name: 'profile',
          component: () => import('../views/ProfileView.vue'),
        },
        {
          path: 'goals',
          redirect: '/dashboard/milestones',
        },
        {
          path: 'milestones',
          name: 'milestones',
          component: () => import('../views/MilestonesView.vue'),
        },
        {
          path: 'quiz',
          name: 'quiz',
          component: () => import('../views/QuizView.vue'),
        },
        {
          path: 'hobby/:hobby/steps',
          name: 'hobby-step-history',
          component: () => import('../views/HobbyStepHistoryView.vue'),
        },
      ],
    },
  ],
})

// Navigation guard for authentication
router.beforeEach((to, from, next) => {
  const authStore = useAuthStore()

  const isLoggedIn = !!authStore.user

  if (to.meta.requiresAuth && !isLoggedIn) {
    next({ name: 'login' })
    return
  }

  if (to.meta.requiresGuest && isLoggedIn) {
    next({ name: 'dashboard' })
    return
  }

  next()
})

export default router
