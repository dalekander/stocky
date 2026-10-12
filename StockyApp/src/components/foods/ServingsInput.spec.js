import { describe, expect, it } from 'vitest'
import { mount } from '@vue/test-utils'
import ServingsInput from '@/components/foods/ServingsInput.vue'

const mountInput = (modelValue = 1) =>
  mount(ServingsInput, {
    props: { modelValue, caloriesPerServing: 150, servingLabel: '1 cup' },
  })

describe('ServingsInput', () => {
  it('shows the serving size and the calculated calories', () => {
    const wrapper = mountInput(2)
    expect(wrapper.text()).toContain('1 cup')
    expect(wrapper.text()).toContain('300 kcal')
    expect(wrapper.find('input').element.value).toBe('2')
  })

  it('steps up and down by half a serving', async () => {
    const wrapper = mountInput(2)
    await wrapper.find('[aria-label="Increase servings"]').trigger('click')
    await wrapper.find('[aria-label="Decrease servings"]').trigger('click')
    expect(wrapper.emitted('update:modelValue')).toEqual([[2.5], [1.5]])
  })

  it('disables decrease at the minimum step', () => {
    const wrapper = mountInput(0.5)
    expect(wrapper.find('[aria-label="Decrease servings"]').attributes('disabled')).toBeDefined()
  })

  it('accepts typed decimals, including a comma', async () => {
    const wrapper = mountInput(1)
    await wrapper.find('input').setValue('1,5')
    expect(wrapper.emitted('update:modelValue').at(-1)).toEqual([1.5])
  })

  it('emits 0 for text that is not a number', async () => {
    const wrapper = mountInput(1)
    await wrapper.find('input').setValue('abc')
    expect(wrapper.emitted('update:modelValue').at(-1)).toEqual([0])
  })

  it('updates the calories when servings change', async () => {
    const wrapper = mountInput(1)
    await wrapper.setProps({ modelValue: 3 })
    expect(wrapper.text()).toContain('450 kcal')
  })
})
