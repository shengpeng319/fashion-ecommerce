import { createRouter, createWebHistory } from 'vue-router'
import { useAuthStore } from '../stores/auth'

const routes = [
  {
    path: '/',
    name: 'Login',
    component: () => import('../views/Login.vue')
  },
  {
    path: '/dashboard',
    name: 'Dashboard',
    component: () => import('../views/Dashboard.vue'),
    meta: { requiresAuth: true }
  },
  {
    path: '/investments',
    name: 'Investments',
    component: () => import('../views/Investments.vue'),
    meta: { requiresAuth: true }
  },
  {
    path: '/dividends',
    name: 'Dividends',
    component: () => import('../views/Dividends.vue'),
    meta: { requiresAuth: true }
  }
]

const router = createRouter({
  history: createWebHistory(),
  routes
})

router.beforeEach((to, _from, next) => {
  const auth = useAuthStore()
  if (to.meta.requiresAuth && !auth.isLoggedIn) {
    next('/')
  } else if (to.path === '/' && auth.isLoggedIn) {
    next('/dashboard')
  } else {
    next()
  }
})

export default router
