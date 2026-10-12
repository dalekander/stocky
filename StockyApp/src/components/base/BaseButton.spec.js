import { describe, expect, it } from 'vitest'
import { mount } from '@vue/test-utils'
import BaseButton from '@/components/base/BaseButton.vue'

describe('BaseButton', () => {
  it('renders its slot and defaults to type=button', () => {
    const wrapper = mount(BaseButton, { slots: { default: 'Save' } })
    expect(wrapper.text()).toBe('Save')
    expect(wrapper.attributes('type')).toBe('button')
  })

  it('emits click when enabled', async () => {
    const wrapper = mount(BaseButton, { slots: { default: 'Go' } })
    await wrapper.trigger('click')
    expect(wrapper.emitted('click')).toHaveLength(1)
  })

  it('is disabled and busy while loading, and shows a spinner', () => {
    const wrapper = mount(BaseButton, { props: { loading: true }, slots: { default: 'Go' } })
    expect(wrapper.attributes('disabled')).toBeDefined()
    expect(wrapper.attributes('aria-busy')).toBe('true')
    expect(wrapper.find('[role="status"]').exists()).toBe(true)
  })

  it('does not emit click when disabled', async () => {
    const wrapper = mount(BaseButton, { props: { disabled: true } })
    await wrapper.trigger('click')
    expect(wrapper.emitted('click')).toBeUndefined()
  })

  it('applies variant and block classes', () => {
    const wrapper = mount(BaseButton, { props: { variant: 'danger', block: true } })
    expect(wrapper.classes()).toContain('bg-red-600')
    expect(wrapper.classes()).toContain('w-full')
  })

  it('supports type=submit', () => {
    expect(mount(BaseButton, { props: { type: 'submit' } }).attributes('type')).toBe('submit')
  })
})
