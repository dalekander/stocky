import { computed, ref } from 'vue'
import { defineStore } from 'pinia'
import * as profileService from '@/services/profileService'
import { useAuthStore } from '@/stores/auth'
import { dailyTarget } from '@/utils/calorieGoal'

/** @typedef {import('@/services/profileService').Profile} Profile */

export const useProfileStore = defineStore('profile', () => {
  const auth = useAuthStore()

  /** @type {import('vue').Ref<Profile|null>} */
  const profile = ref(null)
  const isLoading = ref(false)
  /** True when the last load failed. */
  const loadFailed = ref(false)
  /** Firestore error code of the last failed load, e.g. "permission-denied". */
  const loadErrorCode = ref('')
  let loadedForUid = null

  const isOnboarded = computed(() => Boolean(profile.value?.onboardedAt))
  const calorieTarget = computed(() => profile.value?.calorieTarget ?? null)

  /** Load the profile once per signed-in user. Never throws; check `loadFailed`. */
  async function ensureLoaded({ force = false } = {}) {
    const uid = auth.requireUid()
    if (!force && loadedForUid === uid) return
    isLoading.value = true
    loadFailed.value = false
    loadErrorCode.value = ''
    try {
      profile.value = await profileService.getProfile(uid)
      loadedForUid = uid
    } catch (caught) {
      loadFailed.value = true
      loadErrorCode.value = caught?.code ?? ''
    } finally {
      isLoading.value = false
    }
  }

  /**
   * Save body details and goal; the daily target is derived here so it can't drift.
   * @param {Omit<Profile, 'calorieTarget'|'onboardedAt'|'updatedAt'>} input
   */
  async function save(input) {
    const now = Date.now()
    const data = {
      gender: input.gender,
      age: input.age,
      heightIn: input.heightIn,
      weightLb: input.weightLb,
      activityLevel: input.activityLevel,
      goalRateLb: input.goalRateLb,
      calorieTarget: dailyTarget(input, input.goalRateLb).target,
      onboardedAt: profile.value?.onboardedAt ?? now,
      updatedAt: now,
    }
    profile.value = await profileService.saveProfile(auth.requireUid(), data)
    loadedForUid = auth.requireUid()
  }

  function reset() {
    profile.value = null
    loadFailed.value = false
    loadErrorCode.value = ''
    loadedForUid = null
  }

  return {
    profile,
    isLoading,
    loadFailed,
    loadErrorCode,
    isOnboarded,
    calorieTarget,
    ensureLoaded,
    save,
    reset,
  }
})
