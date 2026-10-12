import { describe, expect, it } from 'vitest'
import { mount } from '@vue/test-utils'
import MealSection from '@/components/diary/MealSection.vue'

const entries = [
  { id: 'e1', foodName: 'Oats', servings: 1, servingLabel: '1 cup', totalCalories: 150 },
  { id: 'e2', foodName: 'Toast', servings: 2, servingLabel: '1 slice', totalCalories: 160 },
]

describe('MealSection', () => {
  it('shows the meal name, subtotal and entries', () => {
    const wrapper = mount(MealSection, { props: { meal: 'breakfast', entries, total: 310 } })
    expect(wrapper.find('h2').text()).toBe('Breakfast')
    expect(wrapper.text()).toContain('310 kcal')
    expect(wrapper.findAll('li')).toHaveLength(2)
  })

  it('shows an empty message when nothing is logged', () => {
    const wrapper = mount(MealSection, { props: { meal: 'snack' } })
    expect(wrapper.text()).toContain('Nothing logged yet')
    expect(wrapper.find('h2').text()).toBe('Snacks')
  })

  it('emits select when an entry is tapped', async () => {
    const wrapper = mount(MealSection, { props: { meal: 'breakfast', entries, total: 310 } })
    await wrapper.findAll('li button')[1].trigger('click')
    expect(wrapper.emitted('select')[0]).toEqual([entries[1]])
  })

  it('has no add-food button (logging happens from the footer)', () => {
    const wrapper = mount(MealSection, { props: { meal: 'lunch' } })
    expect(wrapper.text()).not.toMatch(/add food/i)
  })
})
