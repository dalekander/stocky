import { describe, expect, it } from 'vitest'
import { mount } from '@vue/test-utils'
import BaseEmptyState from '@/components/base/BaseEmptyState.vue'

describe('BaseEmptyState', () => {
  it('shows title and description', () => {
    const wrapper = mount(BaseEmptyState, { props: { title: 'Nothing', description: 'Add one' } })
    expect(wrapper.text()).toContain('Nothing')
    expect(wrapper.text()).toContain('Add one')
  })

  it('renders the action slot only when provided', () => {
    expect(
      mount(BaseEmptyState, { props: { title: 'x' } })
        .find('button')
        .exists(),
    ).toBe(false)
    const withSlot = mount(BaseEmptyState, {
      props: { title: 'x' },
      slots: { default: '<button>Create</button>' },
    })
    expect(withSlot.find('button').text()).toBe('Create')
  })
})
