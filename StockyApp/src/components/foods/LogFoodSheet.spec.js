import { afterEach, describe, expect, it } from 'vitest'
import { mount } from '@vue/test-utils'
import LogFoodSheet from '@/components/foods/LogFoodSheet.vue'

const food = { id: 'f1', name: 'Oatmeal', calories: 150, servingLabel: '1 cup' }
let wrapper
afterEach(() => {
  wrapper?.unmount()
  document.body.innerHTML = ''
})

const mountSheet = (props = {}) => {
  wrapper = mount(LogFoodSheet, {
    props: { open: true, food, defaultMeal: 'lunch', dateLabel: 'Today', ...props },
    attachTo: document.body,
  })
  return wrapper
}

const radios = () => [...document.body.querySelectorAll('[role="radio"]')]
const mealRadio = (label) => radios().find((radio) => radio.textContent.trim() === label)
const servingsInput = () => document.body.querySelector('input[inputmode="decimal"]')
const logButton = () =>
  [...document.body.querySelectorAll('button')].find((b) => b.textContent.includes('Log to'))

describe('LogFoodSheet', () => {
  it('shows the food, the day and preselects the default meal', () => {
    mountSheet()
    expect(document.body.textContent).toContain('Oatmeal')
    expect(document.body.textContent).toContain('Logging for Today')
    expect(mealRadio('Lunch').getAttribute('aria-checked')).toBe('true')
    expect(logButton().textContent).toContain('Log to Lunch')
  })

  it('emits the chosen meal and servings', async () => {
    mountSheet()
    mealRadio('Dinner').click()
    document.body.querySelector('[aria-label="Increase servings"]').click()
    await wrapper.vm.$nextTick()
    logButton().click()

    expect(wrapper.emitted('confirm')[0]).toEqual([{ servings: 1.5, meal: 'dinner' }])
  })

  it('does not confirm invalid servings and explains why', async () => {
    mountSheet()
    servingsInput().value = '0'
    servingsInput().dispatchEvent(new Event('input'))
    await wrapper.vm.$nextTick()
    logButton().click()
    await wrapper.vm.$nextTick()

    expect(wrapper.emitted('confirm')).toBeUndefined()
    expect(document.body.querySelector('[role="alert"]').textContent).toMatch(/greater than 0/i)
  })

  it('shows a save error from the parent', () => {
    mountSheet({ error: 'Could not log this food.' })
    expect(document.body.textContent).toContain('Could not log this food.')
  })

  it('resets servings and meal every time it opens', async () => {
    mountSheet()
    mealRadio('Dinner').click()
    document.body.querySelector('[aria-label="Increase servings"]').click()
    await wrapper.setProps({ open: false })
    await wrapper.setProps({ open: true })

    expect(logButton().textContent).toContain('Log to Lunch')
    expect(servingsInput().value).toBe('1')
  })
})
