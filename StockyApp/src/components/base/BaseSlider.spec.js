import { describe, expect, it } from 'vitest'
import { mount } from '@vue/test-utils'
import BaseSlider from '@/components/base/BaseSlider.vue'

const props = { modelValue: -1, min: -2, max: 2, step: 0.5, label: 'Weekly change' }

describe('BaseSlider', () => {
  it('renders a range input with bounds and an accessible name', () => {
    const wrapper = mount(BaseSlider, { props: { ...props, valueText: 'Lose 1 lb / week' } })
    const input = wrapper.find('input[type="range"]')
    expect(input.attributes('min')).toBe('-2')
    expect(input.attributes('max')).toBe('2')
    expect(input.attributes('step')).toBe('0.5')
    expect(input.attributes('aria-valuetext')).toBe('Lose 1 lb / week')
    expect(wrapper.find('label').text()).toBe('Weekly change')
  })

  it('emits a number, not a string', async () => {
    const wrapper = mount(BaseSlider, { props })
    await wrapper.find('input').setValue('1.5')
    expect(wrapper.emitted('update:modelValue')[0]).toEqual([1.5])
  })

  it('shows end labels', () => {
    const wrapper = mount(BaseSlider, {
      props: { ...props, minLabel: 'Lose 2 lb', maxLabel: 'Gain 2 lb' },
    })
    expect(wrapper.text()).toContain('Lose 2 lb')
    expect(wrapper.text()).toContain('Gain 2 lb')
  })
})
