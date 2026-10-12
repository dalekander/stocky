import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { nextTick, ref } from 'vue'
import { freshPinia, sampleFoods, withSetup } from '@/test/utils'

vi.mock('@/services/firebase', () => ({ auth: null, db: null, isFirebaseConfigured: true }))
vi.mock('@/services/authService', () => ({ observeAuth: vi.fn() }))
vi.mock('@/services/foodsService', () => ({
  listFoods: vi.fn(),
  searchFoodsByPrefix: vi.fn(),
}))

import * as foodsService from '@/services/foodsService'
import { useFoodSearch } from '@/composables/useFoodSearch'
import { useAuthStore } from '@/stores/auth'
import { useFoodsStore } from '@/stores/foods'

const grilledSalmon = {
  id: 'x1',
  name: 'Grilled salmon',
  nameLower: 'grilled salmon',
  calories: 280,
  servingLabel: '1 fillet',
  lastUsedAt: 1,
}

describe('useFoodSearch', () => {
  let query
  let search

  beforeEach(async () => {
    vi.useFakeTimers()
    const pinia = freshPinia()
    useAuthStore().user = { uid: 'u1', email: null, displayName: null }
    foodsService.listFoods.mockResolvedValue(sampleFoods())
    foodsService.searchFoodsByPrefix.mockResolvedValue([])
    await useFoodsStore().load()

    query = ref('')
    search = withSetup(() => useFoodSearch(query), { pinia })
  })

  afterEach(() => {
    search.unmount()
    vi.useRealTimers()
  })

  it('shows every food, most recent first, when the query is empty', () => {
    expect(search.result.results.value.map((food) => food.id)).toEqual(['f1', 'f2', 'f3'])
  })

  it('filters loaded foods instantly, matching anywhere and ignoring case', async () => {
    query.value = '  BREAST '
    await nextTick()
    expect(search.result.results.value.map((food) => food.name)).toEqual(['Chicken breast'])
  })

  it('does not hit Firestore until the user pauses typing', async () => {
    query.value = 'g'
    await nextTick()
    query.value = 'gr'
    await nextTick()
    expect(foodsService.searchFoodsByPrefix).not.toHaveBeenCalled()
    expect(search.result.isSearching.value).toBe(true)

    await vi.advanceTimersByTimeAsync(300)
    expect(foodsService.searchFoodsByPrefix).toHaveBeenCalledTimes(1)
    expect(foodsService.searchFoodsByPrefix).toHaveBeenCalledWith('u1', 'gr')
    expect(search.result.isSearching.value).toBe(false)
  })

  it('adds matches that exist only in Firestore, without duplicates', async () => {
    foodsService.searchFoodsByPrefix.mockResolvedValue([sampleFoods()[0], grilledSalmon])
    query.value = 'o'
    await nextTick()
    await vi.advanceTimersByTimeAsync(300)

    const names = search.result.results.value.map((food) => food.name)
    expect(names.filter((name) => name === 'Oatmeal')).toHaveLength(1)
  })

  it('finds a food that the loaded list did not have', async () => {
    foodsService.searchFoodsByPrefix.mockResolvedValue([grilledSalmon])
    query.value = 'gri'
    await nextTick()
    await vi.advanceTimersByTimeAsync(300)
    await nextTick()

    expect(search.result.results.value.map((food) => food.name)).toContain('Grilled salmon')
  })

  it('keeps local results when the remote search fails', async () => {
    foodsService.searchFoodsByPrefix.mockRejectedValue({ code: 'unavailable' })
    query.value = 'ban'
    await nextTick()
    await vi.advanceTimersByTimeAsync(300)

    expect(search.result.results.value.map((food) => food.name)).toEqual(['Banana'])
    expect(search.result.isSearching.value).toBe(false)
  })

  it('ignores a stale remote response after the query changed', async () => {
    let resolveFirst
    foodsService.searchFoodsByPrefix.mockReturnValueOnce(
      new Promise((resolve) => {
        resolveFirst = resolve
      }),
    )
    query.value = 'gri'
    await nextTick()
    await vi.advanceTimersByTimeAsync(300)

    query.value = 'ban'
    await nextTick()
    resolveFirst([grilledSalmon])
    await vi.advanceTimersByTimeAsync(300)

    expect(search.result.results.value.map((food) => food.name)).toEqual(['Banana'])
  })

  it('shows the plain list again, without duplicates, when the query is emptied', async () => {
    foodsService.searchFoodsByPrefix.mockResolvedValue([grilledSalmon])
    query.value = 'gri'
    await nextTick()
    await vi.advanceTimersByTimeAsync(300)

    query.value = ''
    await nextTick()

    // The store keeps foods found remotely (they belong to the user), so the
    // empty-query list is simply the store list, each food once.
    const ids = search.result.results.value.map((food) => food.id)
    expect(search.result.isSearching.value).toBe(false)
    expect(ids).toEqual(useFoodsStore().byRecentlyUsed.map((food) => food.id))
    expect(new Set(ids).size).toBe(ids.length)
  })
})
