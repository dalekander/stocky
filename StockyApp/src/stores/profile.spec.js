import { beforeEach, describe, expect, it, vi } from 'vitest'
import { freshPinia } from '@/test/utils'

vi.mock('@/services/firebase', () => ({ auth: null, db: null, isFirebaseConfigured: true }))
vi.mock('@/services/authService', () => ({ observeAuth: vi.fn() }))
vi.mock('@/services/profileService', () => ({
  getProfile: vi.fn(),
  saveProfile: vi.fn(async (uid, data) => data),
}))

import * as profileService from '@/services/profileService'
import { useAuthStore } from '@/stores/auth'
import { useProfileStore } from '@/stores/profile'

const details = {
  gender: 'female',
  age: 30,
  heightIn: 65,
  weightLb: 165,
  activityLevel: 'light',
}

describe('profile store', () => {
  let store
  beforeEach(() => {
    freshPinia()
    useAuthStore().user = { uid: 'u1', email: null, displayName: null }
    store = useProfileStore()
  })

  describe('ensureLoaded', () => {
    it('treats a missing profile as not onboarded', async () => {
      profileService.getProfile.mockResolvedValue(null)
      await store.ensureLoaded()
      expect(store.profile).toBeNull()
      expect(store.isOnboarded).toBe(false)
      expect(store.loadFailed).toBe(false)
      expect(store.calorieTarget).toBeNull()
    })

    it('recognises an onboarded user and exposes the target', async () => {
      profileService.getProfile.mockResolvedValue({
        ...details,
        calorieTarget: 1800,
        onboardedAt: 1,
      })
      await store.ensureLoaded()
      expect(store.isOnboarded).toBe(true)
      expect(store.calorieTarget).toBe(1800)
    })

    it('loads once per user unless forced', async () => {
      profileService.getProfile.mockResolvedValue(null)
      await store.ensureLoaded()
      await store.ensureLoaded()
      expect(profileService.getProfile).toHaveBeenCalledTimes(1)
      await store.ensureLoaded({ force: true })
      expect(profileService.getProfile).toHaveBeenCalledTimes(2)
    })

    it('records failures with the error code and never throws', async () => {
      profileService.getProfile.mockRejectedValue({ code: 'permission-denied' })
      await expect(store.ensureLoaded()).resolves.toBeUndefined()
      expect(store.loadFailed).toBe(true)
      expect(store.loadErrorCode).toBe('permission-denied')
      expect(store.isOnboarded).toBe(false)
    })

    it('clears a previous failure on a successful retry', async () => {
      profileService.getProfile.mockRejectedValueOnce({ code: 'unavailable' })
      await store.ensureLoaded()
      profileService.getProfile.mockResolvedValueOnce(null)
      await store.ensureLoaded()
      expect(store.loadFailed).toBe(false)
      expect(store.loadErrorCode).toBe('')
    })
  })

  describe('save', () => {
    it('derives the daily target from details and goal', async () => {
      await store.save({ ...details, goalRateLb: -1 })

      expect(profileService.saveProfile).toHaveBeenCalledWith(
        'u1',
        expect.objectContaining({
          ...details,
          goalRateLb: -1,
          calorieTarget: 1520,
        }),
      )
      expect(store.isOnboarded).toBe(true)
      expect(store.calorieTarget).toBe(1520)
    })

    it('keeps the original onboardedAt when the plan is edited', async () => {
      await store.save({ ...details, goalRateLb: -1 })
      const first = store.profile.onboardedAt

      await new Promise((resolve) => setTimeout(resolve, 5))
      await store.save({ ...details, goalRateLb: 0 })

      expect(store.profile.onboardedAt).toBe(first)
      expect(store.profile.updatedAt).toBeGreaterThanOrEqual(first)
      expect(store.calorieTarget).toBe(2020)
    })

    it('does not mark the user onboarded when saving fails', async () => {
      profileService.saveProfile.mockRejectedValueOnce({ code: 'permission-denied' })
      await expect(store.save({ ...details, goalRateLb: -1 })).rejects.toMatchObject({
        code: 'permission-denied',
      })
      expect(store.isOnboarded).toBe(false)
    })
  })

  it('reset clears the profile and failure state', async () => {
    await store.save({ ...details, goalRateLb: 0 })
    store.reset()
    expect(store.profile).toBeNull()
    expect(store.loadFailed).toBe(false)
  })
})
