import { describe, expect, it } from 'vitest'
import { mount } from '@vue/test-utils'
import FoodForm from '@/components/foods/FoodForm.vue'

async function fill(wrapper, { name, calories, serving }) {
  const inputs = wrapper.findAll('input')
  if (name !== undefined) await inputs[0].setValue(name)
  if (calories !== undefined) await inputs[1].setValue(calories)
  if (serving !== undefined) await inputs[2].setValue(serving)
}

describe('FoodForm', () => {
  it('shows validation errors and does not submit an empty form', async () => {
    const wrapper = mount(FoodForm)
    await wrapper.find('form').trigger('submit')
    expect(wrapper.emitted('submit')).toBeUndefined()
    expect(wrapper.findAll('[role="alert"]').length).toBeGreaterThanOrEqual(2)
  })

  it('emits normalised values for valid input', async () => {
    const wrapper = mount(FoodForm)
    await fill(wrapper, { name: '  Oatmeal ', calories: '150', serving: '' })
    await wrapper.find('form').trigger('submit')
    expect(wrapper.emitted('submit')[0][0]).toEqual({
      name: 'Oatmeal',
      calories: 150,
      servingLabel: '1 serving',
    })
  })

  it('pre-fills from initial values (edit mode)', () => {
    const wrapper = mount(FoodForm, {
      props: { initial: { name: 'Banana', calories: 100, servingLabel: '1 medium' } },
    })
    const values = wrapper.findAll('input').map((input) => input.element.value)
    expect(values).toEqual(['Banana', '100', '1 medium'])
  })

  it('warns about a duplicate name but still lets the user save', async () => {
    const wrapper = mount(FoodForm, { props: { existingNames: ['Banana'] } })
    await fill(wrapper, { name: ' banana ', calories: '100' })
    expect(wrapper.text()).toMatch(/already have a food with this name/i)

    await wrapper.find('form').trigger('submit')
    expect(wrapper.emitted('submit')).toHaveLength(1)
  })

  it('uses the submit label and shows a server error', () => {
    const wrapper = mount(FoodForm, { props: { submitLabel: 'Create food', error: 'Nope' } })
    expect(wrapper.find('button[type="submit"]').text()).toBe('Create food')
    expect(wrapper.text()).toContain('Nope')
  })

  it('disables the submit button while saving', () => {
    const wrapper = mount(FoodForm, { props: { isSaving: true } })
    expect(wrapper.find('button[type="submit"]').attributes('disabled')).toBeDefined()
  })
})
