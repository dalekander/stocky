import { describe, expect, it } from 'vitest'
import { mount } from '@vue/test-utils'
import CalorieBarChart from '@/components/week/CalorieBarChart.vue'

const days = [
  { date: '2026-10-06', label: 'Tue', calories: 0 },
  { date: '2026-10-07', label: 'Wed', calories: 1000 },
  { date: '2026-10-08', label: 'Thu', calories: 2000 },
]

describe('CalorieBarChart', () => {
  it('renders one button per day with an accessible label', () => {
    const wrapper = mount(CalorieBarChart, { props: { days } })
    const buttons = wrapper.findAll('button')
    expect(buttons).toHaveLength(3)
    expect(buttons[2].attributes('aria-label')).toBe('Thu: 2,000 calories. Open this day.')
  })

  it('scales bar height to the largest day', () => {
    const wrapper = mount(CalorieBarChart, { props: { days } })
    const heights = wrapper.findAll('span[style]').map((bar) => bar.attributes('style'))
    expect(heights[0]).toContain('height: 0%')
    expect(heights[1]).toContain('height: 50%')
    expect(heights[2]).toContain('height: 100%')
  })

  it('shows calories for days with data', () => {
    const wrapper = mount(CalorieBarChart, { props: { days } })
    expect(wrapper.text()).toContain('1,000')
    expect(wrapper.text()).toContain('2,000')
  })

  it('emits the date when a bar is tapped', async () => {
    const wrapper = mount(CalorieBarChart, { props: { days } })
    await wrapper.findAll('button')[1].trigger('click')
    expect(wrapper.emitted('select')[0]).toEqual(['2026-10-07'])
  })

  it('highlights the selected day', () => {
    const wrapper = mount(CalorieBarChart, { props: { days, selectedDate: '2026-10-08' } })
    const bars = wrapper.findAll('span[style]')
    expect(bars[2].classes()).toContain('bg-brand-600')
    expect(bars[1].classes()).not.toContain('bg-brand-600')
  })

  it('does not divide by zero for an empty week', () => {
    const empty = days.map((day) => ({ ...day, calories: 0 }))
    const wrapper = mount(CalorieBarChart, { props: { days: empty } })
    const styles = wrapper.findAll('span[style]').map((bar) => bar.attributes('style'))
    expect(styles.every((style) => style.includes('height: 0%'))).toBe(true)
  })
})
