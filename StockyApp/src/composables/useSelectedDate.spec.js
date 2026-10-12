import { describe, expect, it, vi } from 'vitest'
import { flushPromises } from '@vue/test-utils'
import { freshPinia, memoryRouter, withSetup } from '@/test/utils'
import { toDateKey } from '@/utils/date'

vi.mock('@/services/firebase', () => ({ auth: null, db: null, isFirebaseConfigured: true }))

import { useSelectedDate } from '@/composables/useSelectedDate'

async function setup(path) {
  const router = memoryRouter()
  await router.push(path)
  await router.isReady()
  return { router, ...withSetup(useSelectedDate, { pinia: freshPinia(), router }) }
}

describe('useSelectedDate', () => {
  it('defaults to today', async () => {
    const { result } = await setup('/')
    expect(result.date.value).toBe(toDateKey())
    expect(result.isToday.value).toBe(true)
  })

  it('reads a valid ?date= param', async () => {
    const { result } = await setup('/?date=2026-10-05')
    expect(result.date.value).toBe('2026-10-05')
    expect(result.isToday.value).toBe(false)
  })

  it('falls back to today for an invalid date', async () => {
    const { result } = await setup('/?date=2026-02-30')
    expect(result.date.value).toBe(toDateKey())
  })

  it('writes the date to the query when changed', async () => {
    const { result, router } = await setup('/')
    result.date.value = '2026-10-06'
    await flushPromises()
    expect(router.currentRoute.value.query.date).toBe('2026-10-06')
  })

  it('removes the param when set back to today', async () => {
    const { result, router } = await setup('/?date=2026-10-05')
    result.date.value = toDateKey()
    await flushPromises()
    expect(router.currentRoute.value.query.date).toBeUndefined()
  })

  it('keeps other query params', async () => {
    const { result, router } = await setup('/?meal=lunch')
    result.date.value = '2026-10-06'
    await flushPromises()
    expect(router.currentRoute.value.query).toMatchObject({ meal: 'lunch', date: '2026-10-06' })
  })
})
