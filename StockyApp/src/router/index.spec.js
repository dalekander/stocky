import { beforeEach, describe, expect, it, vi } from 'vitest'

vi.mock('@/services/firebase', () => ({ auth: null, db: null, isFirebaseConfigured: true }))
vi.mock('@/services/authService', () => ({ observeAuth: vi.fn() }))
vi.mock('@/services/profileService', () => ({ getProfile: vi.fn(), saveProfile: vi.fn() }))
vi.mock('@/services/foodsService', () => ({ listFoods: vi.fn(async () => []) }))
vi.mock('@/services/entriesService', () => ({
  listEntriesByDate: vi.fn(async () => []),
  listEntriesInRange: vi.fn(async () => []),
}))

/**
 * Load a fresh router + stores for each scenario (the router is a module singleton).
 * @param {{ user?: object|null, profile?: object|null, profileError?: object|null }} options
 */
async function loadRouter({ user = null, profile = null, profileError = null } = {}) {
  vi.resetModules()
  window.history.replaceState({}, '', '/')

  const { createPinia, setActivePinia } = await import('pinia')
  setActivePinia(createPinia())

  const profileService = await import('@/services/profileService')
  if (profileError) profileService.getProfile.mockRejectedValue(profileError)
  else profileService.getProfile.mockResolvedValue(profile)

  const { useAuthStore } = await import('@/stores/auth')
  const auth = useAuthStore()
  auth.user = user
  auth.skipInit()

  const router = (await import('@/router')).default
  return { router, profileService }
}

const signedIn = { uid: 'u1', email: 'a@b.co', displayName: null }
const onboarded = {
  gender: 'female',
  age: 30,
  heightIn: 65,
  weightLb: 165,
  activityLevel: 'light',
  goalRateLb: -1,
  calorieTarget: 1520,
  onboardedAt: 1,
}

describe('router guard', () => {
  beforeEach(() => {
    document.title = ''
  })

  it('sends signed-out users to login and remembers where they were going', async () => {
    const { router } = await loadRouter({ user: null })
    await router.push('/foods')
    const route = router.currentRoute.value
    expect(route.name).toBe('login')
    expect(route.query.redirect).toBe('/foods')
  })

  it('lets signed-out users open login and signup', async () => {
    const { router } = await loadRouter({ user: null })
    await router.push('/signup')
    expect(router.currentRoute.value.name).toBe('signup')
  })

  it('sends signed-in users without a profile to onboarding', async () => {
    const { router } = await loadRouter({ user: signedIn, profile: null })
    await router.push('/')
    expect(router.currentRoute.value.name).toBe('onboarding')
  })

  it('sends a not-onboarded user to onboarding from any page', async () => {
    const { router } = await loadRouter({ user: signedIn, profile: null })
    await router.push('/foods')
    expect(router.currentRoute.value.name).toBe('onboarding')
  })

  it('does not loop: onboarding itself is reachable while not onboarded', async () => {
    const { router } = await loadRouter({ user: signedIn, profile: null })
    await router.push('/onboarding')
    expect(router.currentRoute.value.name).toBe('onboarding')
  })

  it('lets onboarded users in', async () => {
    const { router } = await loadRouter({ user: signedIn, profile: onboarded })
    await router.push('/foods')
    expect(router.currentRoute.value.name).toBe('foods')
  })

  it('keeps signed-in users away from login', async () => {
    const { router } = await loadRouter({ user: signedIn, profile: onboarded })
    await router.push('/login')
    expect(router.currentRoute.value.name).toBe('diary')
  })

  it('still sends users to onboarding when the profile read is denied', async () => {
    const { router } = await loadRouter({
      user: signedIn,
      profileError: { code: 'permission-denied' },
    })
    await router.push('/')
    expect(router.currentRoute.value.name).toBe('onboarding')
  })

  it('does not force onboarding when offline, so an existing plan is not overwritten', async () => {
    const { router } = await loadRouter({ user: signedIn, profileError: { code: 'unavailable' } })
    await router.push('/foods')
    expect(router.currentRoute.value.name).toBe('foods')
  })

  it('redirects unknown paths to the diary', async () => {
    const { router } = await loadRouter({ user: signedIn, profile: onboarded })
    await router.push('/does-not-exist')
    expect(router.currentRoute.value.name).toBe('diary')
  })

  it('no longer has a /week page (the chart lives in Settings)', async () => {
    const { router } = await loadRouter({ user: signedIn, profile: onboarded })
    await router.push('/week')
    expect(router.currentRoute.value.name).toBe('diary')
  })

  it('hides the footer on the Log food page', async () => {
    const { router } = await loadRouter({ user: signedIn, profile: onboarded })
    await router.push('/add')
    expect(router.currentRoute.value.meta.hideTabBar).toBe(true)
  })

  it('sets the document title', async () => {
    const { router } = await loadRouter({ user: signedIn, profile: onboarded })
    await router.push('/foods')
    expect(document.title).toBe('My foods · Stocky')
  })
})
