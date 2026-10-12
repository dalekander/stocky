import { describe, expect, it } from 'vitest'
import { mount } from '@vue/test-utils'
import DateSwitcher from '@/components/diary/DateSwitcher.vue'
import { addDays, toDateKey } from '@/utils/date'

const today = toDateKey()

describe('DateSwitcher', () => {
  it('labels today and hides "jump to today"', () => {
    const wrapper = mount(DateSwitcher, { props: { modelValue: today } })
    expect(wrapper.text()).toContain('Today')
    expect(wrapper.text()).not.toContain('Jump to today')
  })

  it('goes to the previous and next day', async () => {
    const wrapper = mount(DateSwitcher, { props: { modelValue: today } })
    await wrapper.find('[aria-label="Previous day"]').trigger('click')
    await wrapper.find('[aria-label="Next day"]').trigger('click')
    expect(wrapper.emitted('update:modelValue')).toEqual([
      [addDays(today, -1)],
      [addDays(today, 1)],
    ])
  })

  it('offers a way back to today from another day', async () => {
    const wrapper = mount(DateSwitcher, { props: { modelValue: addDays(today, -3) } })
    const jump = wrapper.findAll('button').find((button) => button.text() === 'Jump to today')
    await jump.trigger('click')
    expect(wrapper.emitted('update:modelValue')[0]).toEqual([today])
  })

  it('emits a picked date from the native date input', async () => {
    const wrapper = mount(DateSwitcher, { props: { modelValue: today } })
    const input = wrapper.find('input[type="date"]')
    input.element.value = '2026-10-05'
    await input.trigger('change')
    expect(wrapper.emitted('update:modelValue')[0]).toEqual(['2026-10-05'])
  })

  it('ignores an empty date value', async () => {
    const wrapper = mount(DateSwitcher, { props: { modelValue: today } })
    const input = wrapper.find('input[type="date"]')
    input.element.value = ''
    await input.trigger('change')
    expect(wrapper.emitted('update:modelValue')).toBeUndefined()
  })
})
