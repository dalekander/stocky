import { computed } from 'vue'
import { useProfileStore } from '@/stores/profile'

/** The signed-in user's body details, goal, and daily calorie target. */
export function useProfile() {
  const store = useProfileStore()

  return {
    profile: computed(() => store.profile),
    calorieTarget: computed(() => store.calorieTarget),
    isOnboarded: computed(() => store.isOnboarded),
    ensureLoaded: store.ensureLoaded,
    save: store.save,
  }
}
