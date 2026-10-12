import { afterEach, describe, expect, it } from 'vitest'
import { mount } from '@vue/test-utils'
import EntryEditSheet from '@/components/diary/EntryEditSheet.vue'

const entry = {
  id: 'e1',
  foodName: 'Rice',
  meal: 'lunch',
  servings: 2,
  servingLabel: '1 cup',
  caloriesPerServing: 200,
  totalCalories: 400,
}
let wrapper
afterEach(() => {
  wrapper?.unmount()
  document.body.innerHTML = ''
})

const mountSheet = (props = {}) => {
  wrapper = mount(EntryEditSheet, {
    props: { open: true, entry, ...props },
    attachTo: document.body,
  })
}
const button = (text) =>
  [...document.body.querySelectorAll('button')].find((b) => b.textContent.trim() === text)
const servingsInput = () => document.body.querySelector('input[inputmode="decimal"]')

describe('EntryEditSheet', () => {
  it('starts from the entry values', () => {
    mountSheet()
    expect(document.body.textContent).toContain('Rice')
    expect(servingsInput().value).toBe('2')
    expect(document.body.textContent).toContain('400 kcal')
  })

  it('emits save with the changed meal and servings', async () => {
    mountSheet()
    const dinner = [...document.body.querySelectorAll('[role="radio"]')].find(
      (radio) => radio.textContent.trim() === 'Dinner',
    )
    dinner.click()
    document.body.querySelector('[aria-label="Increase servings"]').click()
    await wrapper.vm.$nextTick()
    button('Save changes').click()

    expect(wrapper.emitted('save')[0]).toEqual([{ meal: 'dinner', servings: 2.5 }])
  })

  it('emits delete', () => {
    mountSheet()
    button('Delete entry').click()
    expect(wrapper.emitted('delete')).toHaveLength(1)
  })

  it('refuses to save zero servings', async () => {
    mountSheet()
    servingsInput().value = '0'
    servingsInput().dispatchEvent(new Event('input'))
    await wrapper.vm.$nextTick()
    button('Save changes').click()
    expect(wrapper.emitted('save')).toBeUndefined()
  })
})
