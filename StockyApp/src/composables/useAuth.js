import { computed, ref } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { ROUTES } from '@/constants/routes'
import { useAuthStore } from '@/stores/auth'
import { useEntriesStore } from '@/stores/entries'
import { useFoodsStore } from '@/stores/foods'
import { useProfileStore } from '@/stores/profile'
import { authErrorMessage } from '@/utils/authErrors'
import { validateCredentials } from '@/utils/validators'

/** Auth actions with loading/error state, for the login, signup and settings screens. */
export function useAuth() {
  const auth = useAuthStore()
  const foods = useFoodsStore()
  const entries = useEntriesStore()
  const profile = useProfileStore()
  const route = useRoute()
  const router = useRouter()

  const isLoading = ref(false)
  const error = ref('')

  const user = computed(() => auth.user)

  /** Only follow in-app redirects, never external URLs. */
  function redirectTarget() {
    const target = route.query.redirect
    return typeof target === 'string' && target.startsWith('/') && !target.startsWith('//')
      ? target
      : '/'
  }

  async function run(action) {
    isLoading.value = true
    error.value = ''
    try {
      await action()
      await router.replace(redirectTarget())
    } catch (caught) {
      error.value = authErrorMessage(caught)
    } finally {
      isLoading.value = false
    }
  }

  function withValidation(email, password, action) {
    const message = validateCredentials(email, password)
    if (message) {
      error.value = message
      return Promise.resolve()
    }
    return run(action)
  }

  const signIn = (email, password) =>
    withValidation(email, password, () => auth.signIn(email, password))
  const signUp = (email, password) =>
    withValidation(email, password, () => auth.signUp(email, password))
  const signInWithGoogle = () => run(() => auth.signInWithGoogle())

  async function logout() {
    isLoading.value = true
    error.value = ''
    try {
      await auth.signOut()
      foods.reset()
      entries.reset()
      profile.reset()
      await router.replace({ name: ROUTES.LOGIN })
    } catch {
      error.value = 'Could not log out. Please try again.'
    } finally {
      isLoading.value = false
    }
  }

  return { user, isLoading, error, signIn, signUp, signInWithGoogle, logout }
}
