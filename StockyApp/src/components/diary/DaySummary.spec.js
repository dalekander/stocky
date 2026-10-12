import { describe, expect, it } from 'vitest'
import { mount } from '@vue/test-utils'
import DaySummary from '@/components/diary/DaySummary.vue'

describe('DaySummary', () => {
  it('shows the total and item count', () => {
    const wrapper = mount(DaySummary, { props: { total: 1234, entryCount: 3 } })
    expect(wrapper.text()).toContain('1,234')
    expect(wrapper.text()).toContain('3 items logged')
  })

  it('uses the singular for one item', () => {
    const wrapper = mount(DaySummary, { props: { total: 100, entryCount: 1 } })
    expect(wrapper.text()).toContain('1 item logged')
  })

  it('hides the progress bar without a goal', () => {
    const wrapper = mount(DaySummary, { props: { total: 500 } })
    expect(wrapper.find('[role="progressbar"]').exists()).toBe(false)
  })

  it('shows calories left and progress under the goal', () => {
    const wrapper = mount(DaySummary, { props: { total: 500, goal: 2000 } })
    expect(wrapper.text()).toContain('1,500 kcal left of 2,000')
    expect(wrapper.find('[role="progressbar"]').attributes('aria-valuenow')).toBe('25')
  })

  it('shows how far over the goal, with progress capped at 100%', () => {
    const wrapper = mount(DaySummary, { props: { total: 2500, goal: 2000 } })
    expect(wrapper.text()).toContain('500 kcal over your 2,000 target')
    expect(wrapper.find('[role="progressbar"]').attributes('aria-valuenow')).toBe('100')
  })
})
