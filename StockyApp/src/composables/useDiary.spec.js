import { beforeEach, describe, expect, it, vi } from 'vitest'
import { flushPromises } from '@vue/test-utils'
import { freshPinia, memoryRouter, withSetup } from '@/test/utils'

vi.mock('@/services/firebase', () => ({ auth: null, db: null, isFirebaseConfigured: true }))
vi.mock('@/services/authService', () => ({ observeAuth: vi.fn() }))
vi.mock('@/services/profileService', () => ({ getProfile: vi.fn(), saveProfile: vi.fn() }))
vi.mock('@/services/entriesService', () => ({
  listEntriesByDate: vi.fn(),
  listEntriesInRange: vi.fn(),
  addEntry: vi.fn(),
  updateEntry: vi.fn(),
  deleteEntry: vi.fn(),
}))

import * as entriesService from '@/services/entriesService'
import { useDiary } from '@/composables/useDiary'
import { useAuthStore } from '@/stores/auth'
import { useProfileStore } from '@/stores/profile'

const entry = (id, meal, totalCalories) => ({
  id,
  date: '2026-10-05',
  meal,
  foodId: 'f',
  foodName: id,
  servingLabel: '1',
  caloriesPerServing: totalCalories,
  servings: 1,
  totalCalories,
  createdAt: 1,
})

describe('useDiary', () => {
  let pinia
  beforeEach(() => {
    pinia = freshPinia()
    useAuthStore().user = { uid: 'u1', email: null, displayName: null }
    entriesService.listEntriesByDate.mockResolvedValue([
      entry('Oats', 'breakfast', 300),
      entry('Toast', 'breakfast', 100),
      entry('Pasta', 'dinner', 600),
    ])
  })

  async function setup(path = '/?date=2026-10-05') {
    const router = memoryRouter()
    await router.push(path)
    await router.isReady()
    const host = withSetup(useDiary, { pinia, router })
    await flushPromises()
    return { router, ...host }
  }

  it('loads the selected day and groups entries by meal in a fixed order', async () => {
    const { result } = await setup()

    expect(entriesService.listEntriesByDate).toHaveBeenCalledWith('u1', '2026-10-05')
    expect(result.meals.value.map((item) => item.meal)).toEqual([
      'breakfast',
      'lunch',
      'dinner',
      'snack',
    ])
    expect(result.meals.value[0].entries).toHaveLength(2)
    expect(result.meals.value[0].total).toBe(400)
    expect(result.meals.value[1].entries).toHaveLength(0)
    expect(result.meals.value[2].total).toBe(600)
  })

  it('totals the day and counts entries', async () => {
    const { result } = await setup()
    expect(result.dayTotal.value).toBe(1000)
    expect(result.entryCount.value).toBe(3)
  })

  it('exposes the calorie goal from the profile', async () => {
    const { result } = await setup()
    expect(result.goal.value).toBeNull()
    useProfileStore().profile = { calorieTarget: 1800, onboardedAt: 1 }
    expect(result.goal.value).toBe(1800)
  })

  it('reloads when the date changes and hides the previous day meanwhile', async () => {
    const { result, router } = await setup()
    entriesService.listEntriesByDate.mockReturnValue(new Promise(() => {}))

    await router.replace({ query: { date: '2026-10-06' } })
    await flushPromises()

    expect(entriesService.listEntriesByDate).toHaveBeenLastCalledWith('u1', '2026-10-06')
    expect(result.entryCount.value).toBe(0)
    expect(result.dayTotal.value).toBe(0)
  })
})
