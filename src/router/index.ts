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
      path: '/about',
      name: 'about',
      component: () => import('../views/AboutView.vue'),
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
      ],
    },
  ],
})

// Navigation guard for authentication - TEMPORARILY DISABLED
router.beforeEach((to, from, next) => {
  const authStore = useAuthStore()

  // Check authentication status
  authStore.checkAuth()

  // TEMPORARILY ALLOW ALL ROUTES - REMOVE THIS FOR PRODUCTION
  next()
  return
})

export default router
