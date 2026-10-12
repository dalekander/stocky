import { describe, expect, it } from 'vitest'
import { entryCalories, formatCalories, sumByMeal, totalFor } from '@/utils/calories'

describe('entryCalories', () => {
  it('multiplies and rounds to whole calories', () => {
    expect(entryCalories(150, 2)).toBe(300)
    expect(entryCalories(155, 0.5)).toBe(78)
    expect(entryCalories(100, 0.333)).toBe(33)
  })

  it('is 0 for 0 servings', () => {
    expect(entryCalories(200, 0)).toBe(0)
  })
})

describe('totalFor', () => {
  it('sums totalCalories', () => {
    expect(totalFor([{ totalCalories: 100 }, { totalCalories: 250 }])).toBe(350)
  })

  it('is 0 for an empty list', () => {
    expect(totalFor([])).toBe(0)
  })
})

describe('sumByMeal', () => {
  it('groups calories by meal and zero-fills the rest', () => {
    const sums = sumByMeal([
      { meal: 'breakfast', totalCalories: 300 },
      { meal: 'breakfast', totalCalories: 100 },
      { meal: 'dinner', totalCalories: 700 },
    ])
    expect(sums).toEqual({ breakfast: 400, lunch: 0, dinner: 700, snack: 0 })
  })

  it('ignores unknown meals', () => {
    const sums = sumByMeal([{ meal: 'brunch', totalCalories: 999 }])
    expect(sums).toEqual({ breakfast: 0, lunch: 0, dinner: 0, snack: 0 })
  })
})

describe('formatCalories', () => {
  it('rounds and adds thousands separators', () => {
    expect(formatCalories(1234.4)).toBe('1,234')
    expect(formatCalories(0)).toBe('0')
    expect(formatCalories(2020.6)).toBe('2,021')
  })
})
