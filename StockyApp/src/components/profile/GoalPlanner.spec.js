import { describe, expect, it } from 'vitest'
import { mount } from '@vue/test-utils'
import GoalPlanner from '@/components/profile/GoalPlanner.vue'

const details = { gender: 'female', age: 30, heightIn: 65, weightLb: 165, activityLevel: 'light' }

describe('GoalPlanner', () => {
  it('shows the daily target and maintenance for the chosen rate', () => {
    const wrapper = mount(GoalPlanner, { props: { details, modelValue: -1 } })
    expect(wrapper.text()).toContain('1,520')
    expect(wrapper.text()).toContain('Lose 1 lb / week')
    expect(wrapper.text()).toContain('Maintenance: 2,020')
  })

  it('updates live as the rate prop changes', async () => {
    const wrapper = mount(GoalPlanner, { props: { details, modelValue: -1 } })
    await wrapper.setProps({ modelValue: 0.5 })
    expect(wrapper.text()).toContain('2,270')
    expect(wrapper.text()).toContain('Gain 0.5 lb / week')
  })

  it('emits the new rate when the slider moves', async () => {
    const wrapper = mount(GoalPlanner, { props: { details, modelValue: -1 } })
    await wrapper.find('input[type="range"]').setValue('-1.5')
    expect(wrapper.emitted('update:modelValue')[0]).toEqual([-1.5])
  })

  it('warns when the pace is limited by the safety minimum', () => {
    const wrapper = mount(GoalPlanner, { props: { details, modelValue: -2 } })
    expect(wrapper.text()).toContain('1,200')
    expect(wrapper.find('[role="status"]').text()).toMatch(/safe minimum/i)
  })

  it('does not warn for a normal pace', () => {
    const wrapper = mount(GoalPlanner, { props: { details, modelValue: -0.5 } })
    expect(wrapper.find('[role="status"]').exists()).toBe(false)
  })

  it('includes a not-medical-advice note', () => {
    const wrapper = mount(GoalPlanner, { props: { details, modelValue: 0 } })
    expect(wrapper.text()).toMatch(/not medical advice/i)
  })
})
