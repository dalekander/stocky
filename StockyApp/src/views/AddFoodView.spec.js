import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { flushPromises, mount } from '@vue/test-utils'
import { freshPinia, memoryRouter, sampleFoods } from '@/test/utils'

vi.mock('@/services/firebase', () => ({ auth: null, db: null, isFirebaseConfigured: true }))
vi.mock('@/services/authService', () => ({ observeAuth: vi.fn() }))
vi.mock('@/services/profileService', () => ({ getProfile: vi.fn(), saveProfile: vi.fn() }))
vi.mock('@/services/foodsService', () => ({
  listFoods: vi.fn(),
  searchFoodsByPrefix: vi.fn(),
  addFood: vi.fn(),
  touchFood: vi.fn(),
}))
vi.mock('@/services/entriesService', () => ({
  addEntry: vi.fn(),
  listEntriesByDate: vi.fn(),
}))

import * as entriesService from '@/services/entriesService'
import * as foodsService from '@/services/foodsService'
import AddFoodView from '@/views/AddFoodView.vue'
import { useAuthStore } from '@/stores/auth'

let wrapper

async function mountView(path = '/add?meal=dinner&date=2026-10-05') {
  const pinia = freshPinia()
  useAuthStore().user = { uid: 'u1', email: 'a@b.co', displayName: null }
  const router = memoryRouter(['diary'])
  router.addRoute({ path: '/add', name: 'add-food', component: AddFoodView })
  await router.push(path)
  await router.isReady()
  wrapper = mount(AddFoodView, { global: { plugins: [pinia, router] }, attachTo: document.body })
  await flushPromises()
  return { router }
}

const wait = (ms) => new Promise((resolve) => setTimeout(resolve, ms))
const rows = () => wrapper.findAll('li').map((li) => li.find('button').text().replace(/\s+/g, ' '))
const bodyButton = (text) =>
  [...document.body.querySelectorAll('button')].find((b) => b.textContent.includes(text))

describe('AddFoodView (Log food)', () => {
  beforeEach(() => {
    foodsService.listFoods.mockResolvedValue(sampleFoods())
    foodsService.searchFoodsByPrefix.mockResolvedValue([])
    foodsService.touchFood.mockResolvedValue(1234)
    entriesService.addEntry.mockImplementation(async (uid, data) => ({ id: 'new', ...data }))
  })

  afterEach(() => {
    wrapper?.unmount()
    document.body.innerHTML = ''
  })

  it('reloads and lists the user’s foods when opened', async () => {
    await mountView()
    expect(foodsService.listFoods).toHaveBeenCalledWith('u1')
    expect(rows()).toHaveLength(3)
    expect(rows()[0]).toContain('Oatmeal')
  })

  it('focuses the search box', async () => {
    await mountView()
    expect(document.activeElement).toBe(wrapper.find('input[type="search"]').element)
  })

  it('filters as the user types', async () => {
    await mountView()
    await wrapper.find('input[type="search"]').setValue('ban')
    expect(rows()).toHaveLength(1)
    expect(rows()[0]).toContain('Banana')
  })

  it('finds foods that only exist in Firestore', async () => {
    foodsService.searchFoodsByPrefix.mockResolvedValue([
      {
        id: 'x1',
        name: 'Grilled salmon',
        nameLower: 'grilled salmon',
        calories: 280,
        servingLabel: '1 fillet',
        lastUsedAt: 1,
      },
    ])
    await mountView()
    await wrapper.find('input[type="search"]').setValue('gri')
    await wait(400)
    await flushPromises()

    expect(foodsService.searchFoodsByPrefix).toHaveBeenCalledWith('u1', 'gri')
    expect(rows().some((row) => row.includes('Grilled salmon'))).toBe(true)
  })

  it('says so when nothing matches', async () => {
    await mountView()
    await wrapper.find('input[type="search"]').setValue('zzz')
    await wait(400)
    await flushPromises()
    expect(wrapper.text()).toContain('No matches')
  })

  it('shows an empty state when the user has no foods yet', async () => {
    foodsService.listFoods.mockResolvedValue([])
    await mountView()
    expect(wrapper.text()).toContain('No saved foods yet')
  })

  it('shows why loading failed', async () => {
    foodsService.listFoods.mockRejectedValue({ code: 'permission-denied' })
    await mountView()
    expect(wrapper.text()).toContain('permission-denied')
  })

  it('logs a picked food to the chosen meal and returns to that day', async () => {
    const { router } = await mountView('/add?meal=dinner&date=2026-10-05')

    await wrapper.findAll('li button')[0].trigger('click') // Oatmeal
    await flushPromises()
    expect(document.body.textContent).toContain('Logging for')

    bodyButton('Log to Dinner').click()
    await flushPromises()

    expect(entriesService.addEntry).toHaveBeenCalledWith(
      'u1',
      expect.objectContaining({
        date: '2026-10-05',
        meal: 'dinner',
        foodId: 'f1',
        foodName: 'Oatmeal',
        servings: 1,
        totalCalories: 150,
      }),
    )
    expect(foodsService.touchFood).toHaveBeenCalledWith('u1', 'f1')
    expect(router.currentRoute.value.name).toBe('diary')
    expect(router.currentRoute.value.query.date).toBe('2026-10-05')
  })

  it('shows an error and stays when logging fails', async () => {
    entriesService.addEntry.mockRejectedValue(new Error('offline'))
    const { router } = await mountView()
    await wrapper.findAll('li button')[0].trigger('click')
    await flushPromises()

    bodyButton('Log to').click()
    await flushPromises()

    expect(document.body.textContent).toMatch(/could not log this food/i)
    expect(router.currentRoute.value.name).toBe('add-food')
  })

  it('creates a new food and then offers to log it', async () => {
    foodsService.addFood.mockResolvedValue({
      id: 'f9',
      name: 'Rice',
      nameLower: 'rice',
      calories: 200,
      servingLabel: '1 cup',
      lastUsedAt: 1,
    })
    await mountView()

    await wrapper
      .findAll('button')
      .find((b) => b.text() === 'Create new food')
      .trigger('click')
    const [name, calories, serving] = wrapper.findAll('form input')
    await name.setValue('Rice')
    await calories.setValue('200')
    await serving.setValue('1 cup')
    await wrapper.find('form').trigger('submit')
    await flushPromises()

    expect(foodsService.addFood).toHaveBeenCalledWith('u1', {
      name: 'Rice',
      calories: 200,
      servingLabel: '1 cup',
    })
    expect(document.body.textContent).toContain('Rice')
    expect(bodyButton('Log to')).toBeTruthy()
  })
})
