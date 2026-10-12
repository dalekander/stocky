import { describe, expect, it } from 'vitest'
import { mount } from '@vue/test-utils'
import FoodListItem from '@/components/foods/FoodListItem.vue'

const food = { id: 'f1', name: 'Oatmeal', calories: 1500, servingLabel: '1 cup' }

describe('FoodListItem', () => {
  it('shows name, serving and formatted calories', () => {
    const wrapper = mount(FoodListItem, { props: { food } })
    expect(wrapper.text()).toContain('Oatmeal')
    expect(wrapper.text()).toContain('1 cup')
    expect(wrapper.text()).toContain('1,500 kcal')
  })

  it('emits select with the food', async () => {
    const wrapper = mount(FoodListItem, { props: { food } })
    await wrapper.find('button').trigger('click')
    expect(wrapper.emitted('select')[0]).toEqual([food])
  })

  it('renders the trailing slot', () => {
    const wrapper = mount(FoodListItem, {
      props: { food },
      slots: { trailing: '<span id="extra">edit</span>' },
    })
    expect(wrapper.find('#extra').exists()).toBe(true)
  })
})
