import { beforeEach, describe, expect, it, vi } from 'vitest'
import { freshPinia, sampleFoods } from '@/test/utils'

vi.mock('@/services/firebase', () => ({ auth: null, db: null, isFirebaseConfigured: true }))
vi.mock('@/services/authService', () => ({ observeAuth: vi.fn() }))
vi.mock('@/services/foodsService', () => ({
  listFoods: vi.fn(),
  addFood: vi.fn(),
  updateFood: vi.fn(),
  deleteFood: vi.fn(),
  touchFood: vi.fn(),
  searchFoodsByPrefix: vi.fn(),
}))

import * as foodsService from '@/services/foodsService'
import { useAuthStore } from '@/stores/auth'
import { useFoodsStore } from '@/stores/foods'

function setup() {
  freshPinia()
  useAuthStore().user = { uid: 'u1', email: 'a@b.co', displayName: null }
  foodsService.listFoods.mockResolvedValue(sampleFoods())
  return useFoodsStore()
}

describe('foods store', () => {
  let store
  beforeEach(() => {
    store = setup()
  })

  describe('load', () => {
    it('loads the signed-in user’s foods', async () => {
      await store.load()
      expect(foodsService.listFoods).toHaveBeenCalledWith('u1')
      expect(store.foods).toHaveLength(3)
      expect(store.isLoading).toBe(false)
      expect(store.error).toBe('')
    })

    it('does not refetch for the same user unless forced', async () => {
      await store.load()
      await store.load()
      expect(foodsService.listFoods).toHaveBeenCalledTimes(1)
      await store.load({ force: true })
      expect(foodsService.listFoods).toHaveBeenCalledTimes(2)
    })

    it('exposes a readable error including the Firestore code', async () => {
      foodsService.listFoods.mockRejectedValue({ code: 'permission-denied' })
      await store.load()
      expect(store.error).toContain('permission-denied')
      expect(store.isLoading).toBe(false)
      expect(store.foods).toEqual([])
    })

    it('retries after a failed load', async () => {
      foodsService.listFoods.mockRejectedValueOnce({ code: 'unavailable' })
      await store.load()
      await store.load()
      expect(foodsService.listFoods).toHaveBeenCalledTimes(2)
      expect(store.foods).toHaveLength(3)
      expect(store.error).toBe('')
    })

    it('throws when nobody is signed in', async () => {
      useAuthStore().user = null
      await expect(store.load()).rejects.toThrow(/signed in/i)
    })
  })

  it('orders byRecentlyUsed with the latest first without mutating the list', async () => {
    await store.load()
    store.foods[2].lastUsedAt = 999
    expect(store.byRecentlyUsed.map((food) => food.id)).toEqual(['f3', 'f1', 'f2'])
    expect(store.foods.map((food) => food.id)).toEqual(['f1', 'f2', 'f3'])
  })

  it('adds a food to the list', async () => {
    const created = { id: 'f9', name: 'Rice', calories: 200, servingLabel: '1 cup', lastUsedAt: 1 }
    foodsService.addFood.mockResolvedValue(created)
    await store.load()
    const result = await store.add({ name: 'Rice', calories: 200, servingLabel: '1 cup' })
    expect(foodsService.addFood).toHaveBeenCalledWith('u1', {
      name: 'Rice',
      calories: 200,
      servingLabel: '1 cup',
    })
    expect(result).toEqual(created)
    expect(store.getById('f9')).toEqual(created)
  })

  it('updates a food in place with the returned changes', async () => {
    foodsService.updateFood.mockResolvedValue({ name: 'Oats', calories: 160 })
    await store.load()
    await store.update('f1', { name: 'Oats', calories: 160, servingLabel: '1 cup' })
    expect(store.getById('f1')).toMatchObject({ name: 'Oats', calories: 160, id: 'f1' })
  })

  it('removes a food', async () => {
    await store.load()
    await store.remove('f2')
    expect(foodsService.deleteFood).toHaveBeenCalledWith('u1', 'f2')
    expect(store.getById('f2')).toBeNull()
    expect(store.foods).toHaveLength(2)
  })

  describe('markUsed', () => {
    it('updates lastUsedAt locally', async () => {
      foodsService.touchFood.mockResolvedValue(5000)
      await store.load()
      await store.markUsed('f3')
      expect(store.getById('f3').lastUsedAt).toBe(5000)
    })

    it('never throws if the write fails', async () => {
      foodsService.touchFood.mockRejectedValue(new Error('offline'))
      await store.load()
      await expect(store.markUsed('f3')).resolves.toBeUndefined()
    })
  })

  describe('searchByPrefix', () => {
    it('returns matches and adds unknown foods to the list', async () => {
      const extra = { id: 'x1', name: 'Grilled salmon', nameLower: 'grilled salmon', calories: 280 }
      foodsService.searchFoodsByPrefix.mockResolvedValue([sampleFoods()[0], extra])
      await store.load()

      const found = await store.searchByPrefix('gri')

      expect(foodsService.searchFoodsByPrefix).toHaveBeenCalledWith('u1', 'gri')
      expect(found).toHaveLength(2)
      expect(store.foods).toHaveLength(4)
      expect(store.foods.filter((food) => food.id === 'f1')).toHaveLength(1)
    })
  })

  it('reset clears the data and allows a fresh load', async () => {
    await store.load()
    store.reset()
    expect(store.foods).toEqual([])
    await store.load()
    expect(foodsService.listFoods).toHaveBeenCalledTimes(2)
  })
})
