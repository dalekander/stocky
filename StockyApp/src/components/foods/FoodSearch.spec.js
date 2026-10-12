import { afterEach, describe, expect, it } from 'vitest'
import { mount } from '@vue/test-utils'
import FoodSearch from '@/components/foods/FoodSearch.vue'

let wrapper
afterEach(() => {
  wrapper?.unmount()
  document.body.innerHTML = ''
})

describe('FoodSearch', () => {
  it('emits update:modelValue on input', async () => {
    wrapper = mount(FoodSearch, { props: { modelValue: '' } })
    await wrapper.find('input').setValue('ban')
    expect(wrapper.emitted('update:modelValue')[0]).toEqual(['ban'])
  })

  it('has an accessible name and a placeholder', () => {
    wrapper = mount(FoodSearch)
    const input = wrapper.find('input')
    expect(input.attributes('aria-label')).toBe('Search foods')
    expect(input.attributes('placeholder')).toBe('Search your foods')
  })

  it('focuses itself when autofocus is set', () => {
    wrapper = mount(FoodSearch, { props: { autofocus: true }, attachTo: document.body })
    expect(document.activeElement).toBe(wrapper.find('input').element)
  })

  it('does not steal focus by default', () => {
    wrapper = mount(FoodSearch, { attachTo: document.body })
    expect(document.activeElement).not.toBe(wrapper.find('input').element)
  })
})
