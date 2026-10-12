import { beforeEach, describe, expect, it, vi } from 'vitest'
import { freshPinia } from '@/test/utils'
import { addDays, toDateKey } from '@/utils/date'

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
import { useWeek } from '@/composables/useWeek'
import { useAuthStore } from '@/stores/auth'
import { useEntriesStore } from '@/stores/entries'

const today = toDateKey()
const log = (date, totalCalories) => ({ id: `${date}-${totalCalories}`, date, totalCalories })

describe('useWeek', () => {
  beforeEach(() => {
    freshPinia()
    useAuthStore().user = { uid: 'u1', email: null, displayName: null }
  })

  it('always returns 7 days ending today', () => {
    const { days } = useWeek()
    expect(days.value).toHaveLength(7)
    expect(days.value[6].date).toBe(today)
    expect(days.value[0].date).toBe(addDays(today, -6))
  })

  it('sums calories per day and averages only days with entries', () => {
    useEntriesStore().rangeEntries = [
      log(today, 500),
      log(today, 700),
      log(addDays(today, -2), 1000),
      log(addDays(today, -30), 9999),
    ]
    const { days, average, hasData } = useWeek()

    expect(days.value[6].calories).toBe(1200)
    expect(days.value[4].calories).toBe(1000)
    expect(days.value.reduce((sum, day) => sum + day.calories, 0)).toBe(2200)
    expect(hasData.value).toBe(true)
    expect(average.value).toBe(1100)
  })

  it('reports no data and a zero average for an empty week', () => {
    const { average, hasData } = useWeek()
    expect(hasData.value).toBe(false)
    expect(average.value).toBe(0)
  })

  it('loads the 7 day range from the service', async () => {
    entriesService.listEntriesInRange.mockResolvedValue([])
    const { load } = useWeek()
    await load()
    expect(entriesService.listEntriesInRange).toHaveBeenCalledWith('u1', addDays(today, -6), today)
  })
})
