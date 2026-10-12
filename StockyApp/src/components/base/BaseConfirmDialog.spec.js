import { afterEach, describe, expect, it } from 'vitest'
import { mount } from '@vue/test-utils'
import BaseConfirmDialog from '@/components/base/BaseConfirmDialog.vue'

let wrapper
afterEach(() => {
  wrapper?.unmount()
  document.body.innerHTML = ''
})

const buttons = () => [...document.body.querySelectorAll('button')]
const byText = (text) => buttons().find((button) => button.textContent.trim() === text)

const mountDialog = (props = {}) => {
  wrapper = mount(BaseConfirmDialog, {
    props: {
      open: true,
      title: 'Delete?',
      message: 'Gone forever',
      confirmLabel: 'Delete',
      ...props,
    },
    attachTo: document.body,
  })
}

describe('BaseConfirmDialog', () => {
  it('shows the title, message and error', () => {
    mountDialog({ error: 'Could not delete' })
    expect(document.body.textContent).toContain('Delete?')
    expect(document.body.textContent).toContain('Gone forever')
    expect(document.body.querySelector('[role="alert"]').textContent).toBe('Could not delete')
  })

  it('emits confirm and cancel', () => {
    mountDialog()
    byText('Delete').click()
    byText('Cancel').click()
    expect(wrapper.emitted('confirm')).toHaveLength(1)
    expect(wrapper.emitted('cancel')).toHaveLength(1)
  })

  it('disables the actions while loading', () => {
    mountDialog({ isLoading: true })
    expect(byText('Cancel').disabled).toBe(true)
    expect(document.body.querySelector('[aria-busy="true"]')).not.toBeNull()
  })
})
