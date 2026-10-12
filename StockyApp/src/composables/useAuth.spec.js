import { beforeEach, describe, expect, it, vi } from 'vitest'
import { flushPromises } from '@vue/test-utils'
import { freshPinia, memoryRouter, withSetup } from '@/test/utils'

vi.mock('@/services/firebase', () => ({ auth: null, db: null, isFirebaseConfigured: true }))
vi.mock('@/services/authService', () => ({
  observeAuth: vi.fn(),
  signInWithEmail: vi.fn(),
  signUpWithEmail: vi.fn(),
  signInWithGoogle: vi.fn(),
  signOut: vi.fn(),
}))
vi.mock('@/services/foodsService', () => ({ listFoods: vi.fn() }))
vi.mock('@/services/entriesService', () => ({ listEntriesByDate: vi.fn() }))
vi.mock('@/services/profileService', () => ({ getProfile: vi.fn(), saveProfile: vi.fn() }))

import * as authService from '@/services/authService'
import { useAuth } from '@/composables/useAuth'
import { useAuthStore } from '@/stores/auth'
import { useEntriesStore } from '@/stores/entries'
import { useFoodsStore } from '@/stores/foods'
import { useProfileStore } from '@/stores/profile'

async function setup(path = '/login') {
  const pinia = freshPinia()
  const router = memoryRouter(['diary', 'login', 'foods'])
  await router.push(path)
  await router.isReady()
  const host = withSetup(useAuth, { pinia, router })
  return { router, pinia, ...host }
}

describe('useAuth', () => {
  beforeEach(() => {
    authService.signInWithEmail.mockResolvedValue({ uid: 'u1' })
    authService.signUpWithEmail.mockResolvedValue({ uid: 'u1' })
    authService.signInWithGoogle.mockResolvedValue({ uid: 'u1' })
    authService.signOut.mockResolvedValue()
  })

  it('validates credentials before calling Firebase', async () => {
    const { result } = await setup()
    await result.signIn('not-an-email', 'pw')
    expect(result.error.value).toMatch(/valid email/i)
    expect(authService.signInWithEmail).not.toHaveBeenCalled()
  })

  it('signs in and goes to the diary', async () => {
    const { result, router } = await setup()
    await result.signIn('a@b.co', 'secret1')
    expect(authService.signInWithEmail).toHaveBeenCalledWith('a@b.co', 'secret1')
    expect(router.currentRoute.value.name).toBe('diary')
    expect(result.error.value).toBe('')
    expect(result.isLoading.value).toBe(false)
  })

  it('returns to the page the user wanted via ?redirect=', async () => {
    const { result, router } = await setup('/login?redirect=/foods')
    await result.signIn('a@b.co', 'secret1')
    expect(router.currentRoute.value.name).toBe('foods')
  })

  it('ignores a redirect that points outside the app', async () => {
    const { result, router } = await setup('/login?redirect=//evil.example')
    await result.signIn('a@b.co', 'secret1')
    expect(router.currentRoute.value.name).toBe('diary')
  })

  it('signs up with email and with Google', async () => {
    const { result, router } = await setup()
    await result.signUp('new@b.co', 'secret1')
    expect(authService.signUpWithEmail).toHaveBeenCalledWith('new@b.co', 'secret1')
    expect(router.currentRoute.value.name).toBe('diary')

    await router.push('/login')
    await result.signInWithGoogle()
    expect(authService.signInWithGoogle).toHaveBeenCalled()
  })

  it('maps Firebase errors to friendly messages and stays on the page', async () => {
    authService.signInWithEmail.mockRejectedValue({ code: 'auth/invalid-credential' })
    const { result, router } = await setup()
    await result.signIn('a@b.co', 'secret1')
    expect(result.error.value).toMatch(/incorrect email or password/i)
    expect(router.currentRoute.value.name).toBe('login')
    expect(result.isLoading.value).toBe(false)
  })

  it('shows no error when the Google popup is closed', async () => {
    authService.signInWithGoogle.mockRejectedValue({ code: 'auth/popup-closed-by-user' })
    const { result, router } = await setup()
    await result.signInWithGoogle()
    expect(result.error.value).toBe('')
    expect(router.currentRoute.value.name).toBe('login')
  })

  it('logs out, clears cached user data and returns to login', async () => {
    const { result, router, pinia } = await setup('/')
    useAuthStore(pinia).user = { uid: 'u1', email: null, displayName: null }
    useFoodsStore(pinia).foods = [{ id: 'f1', name: 'Rice' }]
    useEntriesStore(pinia).entries = [{ id: 'e1' }]
    useProfileStore(pinia).profile = { onboardedAt: 1 }

    await result.logout()
    await flushPromises()

    expect(authService.signOut).toHaveBeenCalled()
    expect(useFoodsStore(pinia).foods).toEqual([])
    expect(useEntriesStore(pinia).entries).toEqual([])
    expect(useProfileStore(pinia).profile).toBeNull()
    expect(router.currentRoute.value.name).toBe('login')
  })

  it('reports a logout failure', async () => {
    authService.signOut.mockRejectedValue(new Error('offline'))
    const { result } = await setup('/')
    await result.logout()
    expect(result.error.value).toMatch(/could not log out/i)
  })
})
