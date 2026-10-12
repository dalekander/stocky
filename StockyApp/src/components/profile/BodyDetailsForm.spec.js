import { describe, expect, it } from 'vitest'
import { mount } from '@vue/test-utils'
import BodyDetailsForm from '@/components/profile/BodyDetailsForm.vue'

async function fillValid(wrapper) {
  await wrapper.findAll('[role="radio"]')[0].trigger('click') // Female
  const [age, feet, inches, weight] = wrapper.findAll('input[type="number"]')
  await age.setValue('30')
  await feet.setValue('5')
  await inches.setValue('5')
  await weight.setValue('165')
}

describe('BodyDetailsForm', () => {
  it('blocks submit and shows errors when details are missing', async () => {
    const wrapper = mount(BodyDetailsForm)
    await wrapper.find('form').trigger('submit')
    expect(wrapper.emitted('submit')).toBeUndefined()
    expect(wrapper.findAll('[role="alert"]').length).toBeGreaterThanOrEqual(3)
  })

  it('emits validated, converted values', async () => {
    const wrapper = mount(BodyDetailsForm)
    await fillValid(wrapper)
    await wrapper.find('form').trigger('submit')
    expect(wrapper.emitted('submit')[0][0]).toEqual({
      gender: 'female',
      age: 30,
      heightIn: 65,
      weightLb: 165,
      activityLevel: 'light',
    })
  })

  it('rejects users under 18', async () => {
    const wrapper = mount(BodyDetailsForm)
    await fillValid(wrapper)
    await wrapper.findAll('input[type="number"]')[0].setValue('16')
    await wrapper.find('form').trigger('submit')
    expect(wrapper.emitted('submit')).toBeUndefined()
    expect(wrapper.text()).toMatch(/at least 18/)
  })

  it('pre-fills when editing an existing plan', () => {
    const wrapper = mount(BodyDetailsForm, {
      props: {
        initial: { gender: 'male', age: 41, heightIn: 70, weightLb: 190, activityLevel: 'active' },
      },
    })
    const numbers = wrapper.findAll('input[type="number"]').map((input) => input.element.value)
    expect(numbers).toEqual(['41', '5', '10', '190'])
    expect(wrapper.find('select').element.value).toBe('active')
    const checked = wrapper
      .findAll('[role="radio"]')
      .find((radio) => radio.attributes('aria-checked') === 'true')
    expect(checked.text()).toBe('Male')
  })
})
