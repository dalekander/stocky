import { describe, expect, it } from 'vitest'
import { mount } from '@vue/test-utils'
import BaseSelect from '@/components/base/BaseSelect.vue'

const options = [
  { value: 'light', label: 'Light' },
  { value: 'active', label: 'Active' },
]

describe('BaseSelect', () => {
  it('renders options and selects the current value', () => {
    const wrapper = mount(BaseSelect, {
      props: { options, modelValue: 'active', label: 'Activity' },
    })
    expect(wrapper.findAll('option')).toHaveLength(2)
    expect(wrapper.find('select').element.value).toBe('active')
    expect(wrapper.find('label').attributes('for')).toBe(wrapper.find('select').attributes('id'))
  })

  it('emits the new value', async () => {
    const wrapper = mount(BaseSelect, {
      props: { options, modelValue: 'light', label: 'Activity' },
    })
    await wrapper.find('select').setValue('active')
    expect(wrapper.emitted('update:modelValue')[0]).toEqual(['active'])
  })

  it('shows an error as an alert', () => {
    const wrapper = mount(BaseSelect, {
      props: { options, label: 'Activity', error: 'Choose one' },
    })
    expect(wrapper.find('[role="alert"]').text()).toBe('Choose one')
  })
})
