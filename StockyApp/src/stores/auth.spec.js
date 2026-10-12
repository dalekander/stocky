import { beforeEach, describe, expect, it, vi } from 'vitest'
import { freshPinia } from '@/test/utils'

vi.mock('@/services/firebase', () => ({ auth: null, db: null, isFirebaseConfigured: true }))
vi.mock('@/services/authService', () => ({
  observeAuth: vi.fn(),
  signInWithEmail: vi.fn(),
  signUpWithEmail: vi.fn(),
  signInWithGoogle: vi.fn(),
  signOut: vi.fn(),
}))

import * as authService from '@/services/authService'
import { useAuthStore } from '@/stores/auth'

describe('auth store', () => {
  beforeEach(() => {
    freshPinia()
  })

  it('starts signed out and not ready', () => {
    const auth = useAuthStore()
    expect(auth.user).toBeNull()
    expect(auth.isLoggedIn).toBe(false)
    expect(auth.isReady).toBe(false)
  })

  it('becomes ready with the user on the first auth event', async () => {
    let emit
    authService.observeAuth.mockImplementation((callback) => {
      emit = callback
      return () => {}
    })
    const auth = useAuthStore()
    auth.init()

    let resolved = false
    auth.whenReady().then(() => {
      resolved = true
    })
    await Promise.resolve()
    expect(resolved).toBe(false)

    emit({ uid: 'u1', email: 'a@b.co', displayName: null })
    await auth.whenReady()

    expect(auth.isReady).toBe(true)
    expect(auth.isLoggedIn).toBe(true)
    expect(auth.user.uid).toBe('u1')
  })

  it('tracks later sign-outs', async () => {
    let emit
    authService.observeAuth.mockImplementation((callback) => {
      emit = callback
      return () => {}
    })
    const auth = useAuthStore()
    auth.init()
    emit({ uid: 'u1', email: null, displayName: null })
    emit(null)
    expect(auth.isLoggedIn).toBe(false)
  })

  it('skipInit marks the store ready without a user', async () => {
    const auth = useAuthStore()
    auth.skipInit()
    await auth.whenReady()
    expect(auth.isReady).toBe(true)
    expect(auth.user).toBeNull()
  })

  it('requireUid returns the uid or throws', () => {
    const auth = useAuthStore()
    expect(() => auth.requireUid()).toThrow(/signed in/i)
    auth.user = { uid: 'u9', email: null, displayName: null }
    expect(auth.requireUid()).toBe('u9')
  })

  it('delegates sign in / up / google / out to the service', async () => {
    const auth = useAuthStore()
    await auth.signIn('a@b.co', 'pw')
    await auth.signUp('c@d.co', 'pw2')
    await auth.signInWithGoogle()
    await auth.signOut()
    expect(authService.signInWithEmail).toHaveBeenCalledWith('a@b.co', 'pw')
    expect(authService.signUpWithEmail).toHaveBeenCalledWith('c@d.co', 'pw2')
    expect(authService.signInWithGoogle).toHaveBeenCalled()
    expect(authService.signOut).toHaveBeenCalled()
  })
})
