import { computed, ref } from 'vue'
import { defineStore } from 'pinia'
import * as authService from '@/services/authService'

export const useAuthStore = defineStore('auth', () => {
  /** @type {import('vue').Ref<import('@/services/authService').AppUser|null>} */
  const user = ref(null)
  const isReady = ref(false)
  const isLoggedIn = computed(() => user.value !== null)

  let resolveReady
  const readyPromise = new Promise((resolve) => {
    resolveReady = resolve
  })

  /** Start listening to Firebase auth state. Call once at startup. */
  function init() {
    return authService.observeAuth((nextUser) => {
      user.value = nextUser
      if (!isReady.value) {
        isReady.value = true
        resolveReady()
      }
    })
  }

  /** Resolves once the first auth state has been received. */
  function whenReady() {
    return readyPromise
  }

  /** For when Firebase is not configured: mark ready with no user. */
  function skipInit() {
    isReady.value = true
    resolveReady()
  }

  function requireUid() {
    if (!user.value) throw new Error('You need to be signed in.')
    return user.value.uid
  }

  async function signIn(email, password) {
    await authService.signInWithEmail(email, password)
  }

  async function signUp(email, password) {
    await authService.signUpWithEmail(email, password)
  }

  async function signInWithGoogle() {
    await authService.signInWithGoogle()
  }

  async function signOut() {
    await authService.signOut()
  }

  return {
    user,
    isReady,
    isLoggedIn,
    init,
    skipInit,
    whenReady,
    requireUid,
    signIn,
    signUp,
    signInWithGoogle,
    signOut,
  }
})
