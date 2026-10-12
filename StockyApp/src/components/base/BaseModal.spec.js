import { afterEach, describe, expect, it } from 'vitest'
import { mount } from '@vue/test-utils'
import BaseModal from '@/components/base/BaseModal.vue'

let wrapper
afterEach(() => {
  wrapper?.unmount()
  document.body.innerHTML = ''
  document.body.style.overflow = ''
})

const mountModal = (props = {}) => {
  wrapper = mount(BaseModal, {
    props: { open: true, title: 'Edit', ...props },
    slots: { default: '<p id="content">Hello</p>' },
    attachTo: document.body,
  })
  return wrapper
}

const dialog = () => document.body.querySelector('[role="dialog"]')

describe('BaseModal', () => {
  it('renders nothing when closed', () => {
    mountModal({ open: false })
    expect(dialog()).toBeNull()
  })

  it('renders an accessible dialog with title and content in the body', () => {
    mountModal()
    expect(dialog()).not.toBeNull()
    expect(dialog().getAttribute('aria-modal')).toBe('true')
    const labelledBy = dialog().getAttribute('aria-labelledby')
    expect(document.getElementById(labelledBy).textContent).toBe('Edit')
    expect(document.getElementById('content').textContent).toBe('Hello')
  })

  it('emits close on Escape', () => {
    mountModal()
    dialog().dispatchEvent(new KeyboardEvent('keydown', { key: 'Escape', bubbles: true }))
    expect(wrapper.emitted('close')).toHaveLength(1)
  })

  it('emits close from the close button', () => {
    mountModal()
    document.body.querySelector('[aria-label="Close"]').click()
    expect(wrapper.emitted('close')).toHaveLength(1)
  })

  it('emits close when the backdrop is clicked', () => {
    mountModal()
    document.body.querySelector('[aria-hidden="true"]').click()
    expect(wrapper.emitted('close')).toHaveLength(1)
  })

  it('locks page scroll while open and restores it after', async () => {
    mountModal({ open: false })
    await wrapper.setProps({ open: true })
    expect(document.body.style.overflow).toBe('hidden')
    await wrapper.setProps({ open: false })
    expect(document.body.style.overflow).toBe('')
  })
})
