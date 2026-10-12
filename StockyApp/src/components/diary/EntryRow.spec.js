import { describe, expect, it } from 'vitest'
import { mount } from '@vue/test-utils'
import EntryRow from '@/components/diary/EntryRow.vue'

const entry = {
  id: 'e1',
  foodName: 'Oatmeal',
  servings: 1.5,
  servingLabel: '1 cup',
  totalCalories: 225,
}

describe('EntryRow', () => {
  it('shows name, servings with size, and calories', () => {
    const wrapper = mount(EntryRow, { props: { entry } })
    expect(wrapper.text()).toContain('Oatmeal')
    expect(wrapper.text()).toContain('1.5 × 1 cup')
    expect(wrapper.text()).toContain('225')
  })

  it('falls back to "serving" for entries without a label', () => {
    const wrapper = mount(EntryRow, { props: { entry: { ...entry, servingLabel: undefined } } })
    expect(wrapper.text()).toContain('1.5 × serving')
  })

  it('emits select with the entry', async () => {
    const wrapper = mount(EntryRow, { props: { entry } })
    await wrapper.find('button').trigger('click')
    expect(wrapper.emitted('select')[0]).toEqual([entry])
  })
})
