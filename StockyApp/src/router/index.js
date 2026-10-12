import { createRouter, createWebHistory } from 'vue-router'
import { ROUTES } from '@/constants/routes'
import { useAuthStore } from '@/stores/auth'
import { useProfileStore } from '@/stores/profile'

const routes = [
  {
    path: '/login',
    name: ROUTES.LOGIN,
    component: () => import('@/views/LoginView.vue'),
    meta: { layout: 'auth', guestOnly: true, title: 'Log in' },
  },
  {
    path: '/signup',
    name: ROUTES.SIGNUP,
    component: () => import('@/views/SignupView.vue'),
    meta: { layout: 'auth', guestOnly: true, title: 'Sign up' },
  },
  {
    path: '/onboarding',
    name: ROUTES.ONBOARDING,
    component: () => import('@/views/OnboardingView.vue'),
    meta: { layout: 'auth', requiresAuth: true, title: 'Your plan' },
  },
  {
    path: '/',
    name: ROUTES.DIARY,
    component: () => import('@/views/DiaryView.vue'),
    meta: { layout: 'app', requiresAuth: true, title: 'Diary' },
  },
  {
    path: '/add',
    name: ROUTES.ADD_FOOD,
    component: () => import('@/views/AddFoodView.vue'),
    meta: {
      layout: 'app',
      requiresAuth: true,
      title: 'Log food',
      showBack: true,
      hideTabBar: true,
    },
  },
  {
    path: '/foods',
    name: ROUTES.FOODS,
    component: () => import('@/views/FoodsView.vue'),
    meta: { layout: 'app', requiresAuth: true, title: 'My foods' },
  },
  {
    path: '/foods/:id',
    name: ROUTES.FOOD_EDIT,
    component: () => import('@/views/FoodEditView.vue'),
    meta: { layout: 'app', requiresAuth: true, title: 'Food', showBack: true, hideTabBar: true },
  },
  {
    path: '/settings',
    name: ROUTES.SETTINGS,
    component: () => import('@/views/SettingsView.vue'),
    meta: { layout: 'app', requiresAuth: true, title: 'Settings' },
  },
  { path: '/:pathMatch(.*)*', redirect: { name: ROUTES.DIARY } },
]

const router = createRouter({
  history: createWebHistory(),
  routes,
})

router.beforeEach(async (to) => {
  const auth = useAuthStore()
  await auth.whenReady()

  if (to.meta.requiresAuth && !auth.isLoggedIn) {
    return { name: ROUTES.LOGIN, query: { redirect: to.fullPath } }
  }
  if (to.meta.guestOnly && auth.isLoggedIn) {
    return { name: ROUTES.DIARY }
  }

  // Users without a profile must finish onboarding first. The only case we let
  // through is being offline ("unavailable"), so an existing plan is never
  // overwritten just because it could not be fetched right now.
  if (to.meta.requiresAuth && to.name !== ROUTES.ONBOARDING) {
    const profile = useProfileStore()
    await profile.ensureLoaded()
    const isOffline = profile.loadFailed && profile.loadErrorCode === 'unavailable'
    if (!profile.isOnboarded && !isOffline) {
      return { name: ROUTES.ONBOARDING }
    }
  }
  return true
})

router.afterEach((to) => {
  document.title = to.meta.title ? `${to.meta.title} · Stocky` : 'Stocky'
})

export default router
