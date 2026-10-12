import { beforeEach, describe, expect, it, vi } from 'vitest'
import { freshPinia } from '@/test/utils'

vi.mock('@/services/firebase', () => ({ auth: null, db: null, isFirebaseConfigured: true }))
vi.mock('@/services/authService', () => ({ observeAuth: vi.fn() }))
vi.mock('@/services/entriesService', () => ({
  listEntriesByDate: vi.fn(),
  listEntriesInRange: vi.fn(),
  addEntry: vi.fn(),
  updateEntry: vi.fn(),
  deleteEntry: vi.fn(),
}))

import * as entriesService from '@/services/entriesService'
import { useAuthStore } from '@/stores/auth'
import { useEntriesStore } from '@/stores/entries'

const entry = (overrides = {}) => ({
  id: 'e1',
  date: '2026-10-12',
  meal: 'lunch',
  foodId: 'f1',
  foodName: 'Rice',
  servingLabel: '1 cup',
  caloriesPerServing: 200,
  servings: 1,
  totalCalories: 200,
  createdAt: 1,
  ...overrides,
})

const food = { id: 'f1', name: 'Rice', calories: 200, servingLabel: '1 cup' }

function deferred() {
  let resolve
  const promise = new Promise((r) => {
    resolve = r
  })
  return { promise, resolve }
}

describe('entries store', () => {
  let store
  beforeEach(() => {
    freshPinia()
    useAuthStore().user = { uid: 'u1', email: null, displayName: null }
    store = useEntriesStore()
  })

  describe('load', () => {
    it('loads entries for a date', async () => {
      entriesService.listEntriesByDate.mockResolvedValue([entry()])
      await store.load('2026-10-12')
      expect(entriesService.listEntriesByDate).toHaveBeenCalledWith('u1', '2026-10-12')
      expect(store.entries).toHaveLength(1)
      expect(store.loadedDate).toBe('2026-10-12')
      expect(store.isLoading).toBe(false)
    })

    it('ignores a slow response that was superseded by a newer request', async () => {
      const slow = deferred()
      entriesService.listEntriesByDate
        .mockReturnValueOnce(slow.promise)
        .mockResolvedValueOnce([entry({ id: 'new', date: '2026-10-13' })])

      const first = store.load('2026-10-12')
      await store.load('2026-10-13')
      slow.resolve([entry({ id: 'old' })])
      await first

      expect(store.loadedDate).toBe('2026-10-13')
      expect(store.entries.map((item) => item.id)).toEqual(['new'])
      expect(store.isLoading).toBe(false)
    })

    it('sets a friendly error when loading fails', async () => {
      entriesService.listEntriesByDate.mockRejectedValue(new Error('boom'))
      await store.load('2026-10-12')
      expect(store.error).toMatch(/could not load/i)
      expect(store.isLoading).toBe(false)
    })
  })

  describe('add', () => {
    it('stores a snapshot of the food with the calculated total', async () => {
      entriesService.addEntry.mockImplementation(async (uid, data) => ({ id: 'new', ...data }))
      const added = await store.add({ date: '2026-10-12', meal: 'dinner', food, servings: 1.5 })

      expect(entriesService.addEntry).toHaveBeenCalledWith(
        'u1',
        expect.objectContaining({
          date: '2026-10-12',
          meal: 'dinner',
          foodId: 'f1',
          foodName: 'Rice',
          servingLabel: '1 cup',
          caloriesPerServing: 200,
          servings: 1.5,
          totalCalories: 300,
        }),
      )
      expect(added.id).toBe('new')
    })

    it('appends only when the entry belongs to the loaded date', async () => {
      entriesService.listEntriesByDate.mockResolvedValue([])
      entriesService.addEntry.mockImplementation(async (uid, data) => ({ id: 'n', ...data }))
      await store.load('2026-10-12')

      await store.add({ date: '2026-10-12', meal: 'lunch', food, servings: 1 })
      await store.add({ date: '2026-10-20', meal: 'lunch', food, servings: 1 })

      expect(store.entries).toHaveLength(1)
    })
  })

  it('update recalculates the total from the snapshot calories', async () => {
    entriesService.listEntriesByDate.mockResolvedValue([entry()])
    entriesService.updateEntry.mockResolvedValue({})
    await store.load('2026-10-12')

    await store.update('e1', { meal: 'dinner', servings: 2.5 })

    expect(entriesService.updateEntry).toHaveBeenCalledWith('u1', 'e1', {
      meal: 'dinner',
      servings: 2.5,
      totalCalories: 500,
    })
    expect(store.entries[0]).toMatchObject({ meal: 'dinner', servings: 2.5, totalCalories: 500 })
  })

  it('update does nothing for an unknown entry', async () => {
    await store.update('missing', { meal: 'lunch', servings: 1 })
    expect(entriesService.updateEntry).not.toHaveBeenCalled()
  })

  it('removes an entry', async () => {
    entriesService.listEntriesByDate.mockResolvedValue([entry(), entry({ id: 'e2' })])
    await store.load('2026-10-12')
    await store.remove('e1')
    expect(entriesService.deleteEntry).toHaveBeenCalledWith('u1', 'e1')
    expect(store.entries.map((item) => item.id)).toEqual(['e2'])
  })

  it('loadRange fills rangeEntries', async () => {
    entriesService.listEntriesInRange.mockResolvedValue([entry(), entry({ id: 'e2' })])
    await store.loadRange('2026-10-06', '2026-10-12')
    expect(entriesService.listEntriesInRange).toHaveBeenCalledWith('u1', '2026-10-06', '2026-10-12')
    expect(store.rangeEntries).toHaveLength(2)
  })

  it('reset clears everything', async () => {
    entriesService.listEntriesByDate.mockResolvedValue([entry()])
    await store.load('2026-10-12')
    store.reset()
    expect(store.entries).toEqual([])
    expect(store.loadedDate).toBe('')
  })
})
