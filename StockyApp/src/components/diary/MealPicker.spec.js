import { describe, expect, it } from 'vitest'
import { mount } from '@vue/test-utils'
import MealPicker from '@/components/diary/MealPicker.vue'

describe('MealPicker', () => {
  it('offers the four meals and marks the selected one', () => {
    const wrapper = mount(MealPicker, { props: { modelValue: 'dinner' } })
    const radios = wrapper.findAll('[role="radio"]')
    expect(radios.map((radio) => radio.text())).toEqual(['Breakfast', 'Lunch', 'Dinner', 'Snacks'])
    expect(radios.map((radio) => radio.attributes('aria-checked'))).toEqual([
      'false',
      'false',
      'true',
      'false',
    ])
  })

  it('emits the meal key', async () => {
    const wrapper = mount(MealPicker, { props: { modelValue: 'dinner' } })
    await wrapper.findAll('[role="radio"]')[3].trigger('click')
    expect(wrapper.emitted('update:modelValue')[0]).toEqual(['snack'])
  })
})
