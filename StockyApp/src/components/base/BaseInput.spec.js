import { describe, expect, it } from 'vitest'
import { mount } from '@vue/test-utils'
import BaseInput from '@/components/base/BaseInput.vue'

describe('BaseInput', () => {
  it('associates the label with the input', () => {
    const wrapper = mount(BaseInput, { props: { label: 'Email' } })
    const id = wrapper.find('input').attributes('id')
    expect(id).toBeTruthy()
    expect(wrapper.find('label').attributes('for')).toBe(id)
    expect(wrapper.find('label').text()).toBe('Email')
  })

  it('emits update:modelValue as the user types', async () => {
    const wrapper = mount(BaseInput, { props: { label: 'Name', modelValue: '' } })
    await wrapper.find('input').setValue('Oatmeal')
    expect(wrapper.emitted('update:modelValue')[0]).toEqual(['Oatmeal'])
  })

  it('shows an error as an alert and marks the input invalid', () => {
    const wrapper = mount(BaseInput, { props: { label: 'Name', error: 'Required' } })
    const input = wrapper.find('input')
    const alert = wrapper.find('[role="alert"]')
    expect(alert.text()).toBe('Required')
    expect(input.attributes('aria-invalid')).toBe('true')
    expect(input.attributes('aria-describedby')).toBe(alert.attributes('id'))
  })

  it('shows a hint without the alert role', () => {
    const wrapper = mount(BaseInput, { props: { label: 'Name', hint: 'Careful' } })
    expect(wrapper.text()).toContain('Careful')
    expect(wrapper.find('[role="alert"]').exists()).toBe(false)
    expect(wrapper.find('input').attributes('aria-invalid')).toBeUndefined()
  })

  it('passes native attributes to the input', () => {
    const wrapper = mount(BaseInput, {
      props: { label: 'Age' },
      attrs: { placeholder: 'e.g. 30', inputmode: 'numeric' },
    })
    expect(wrapper.find('input').attributes('placeholder')).toBe('e.g. 30')
    expect(wrapper.find('input').attributes('inputmode')).toBe('numeric')
  })
})
