import { describe, expect, it } from 'vitest'
import { mount } from '@vue/test-utils'
import BaseSegmented from '@/components/base/BaseSegmented.vue'

const options = [
  { value: 'female', label: 'Female' },
  { value: 'male', label: 'Male' },
]

describe('BaseSegmented', () => {
  it('renders a labelled radiogroup with the current option checked', () => {
    const wrapper = mount(BaseSegmented, {
      props: { options, modelValue: 'male', label: 'Gender' },
    })
    expect(wrapper.find('[role="radiogroup"]').attributes('aria-label')).toBe('Gender')
    const radios = wrapper.findAll('[role="radio"]')
    expect(radios.map((radio) => radio.attributes('aria-checked'))).toEqual(['false', 'true'])
  })

  it('emits the chosen value', async () => {
    const wrapper = mount(BaseSegmented, { props: { options, modelValue: '', label: 'Gender' } })
    await wrapper.findAll('[role="radio"]')[0].trigger('click')
    expect(wrapper.emitted('update:modelValue')[0]).toEqual(['female'])
  })
})
