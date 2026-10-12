import { describe, expect, it, vi } from 'vitest'
import { flushPromises, mount } from '@vue/test-utils'
import { freshPinia, memoryRouter } from '@/test/utils'

vi.mock('@/services/firebase', () => ({ auth: null, db: null, isFirebaseConfigured: true }))

import BottomTabBar from '@/components/nav/BottomTabBar.vue'

async function mountBar(path = '/') {
  const router = memoryRouter(['diary', 'foods', 'settings', 'add-food'])
  await router.push(path)
  await router.isReady()
  const wrapper = mount(BottomTabBar, { global: { plugins: [freshPinia(), router] } })
  return { wrapper, router }
}

describe('BottomTabBar', () => {
  it('has Diary, Foods and Settings tabs', async () => {
    const { wrapper } = await mountBar()
    expect(wrapper.findAll('a').map((link) => link.text())).toEqual(['Diary', 'Foods', 'Settings'])
  })

  it('puts the Log food button between the tabs', async () => {
    const { wrapper } = await mountBar()
    const order = wrapper.findAll('a, button').map((el) => el.attributes('aria-label') ?? el.text())
    expect(order).toEqual(['Diary', 'Foods', 'Log food', 'Settings'])
  })

  it('opens Log food for today', async () => {
    const { wrapper, router } = await mountBar('/')
    await wrapper.find('[aria-label="Log food"]').trigger('click')
    await flushPromises()
    expect(router.currentRoute.value.name).toBe('add-food')
    expect(router.currentRoute.value.query.date).toBeUndefined()
  })

  it('keeps the day being viewed when logging', async () => {
    const { wrapper, router } = await mountBar('/?date=2026-10-05')
    await wrapper.find('[aria-label="Log food"]').trigger('click')
    await flushPromises()
    expect(router.currentRoute.value.name).toBe('add-food')
    expect(router.currentRoute.value.query.date).toBe('2026-10-05')
  })
})
