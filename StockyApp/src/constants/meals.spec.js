import { describe, expect, it } from 'vitest'
import { MEALS, MEAL_LABELS, guessMeal } from '@/constants/meals'

const at = (hour) => new Date(2026, 9, 12, hour, 0)

describe('meals', () => {
  it('has a label for every meal', () => {
    for (const meal of MEALS) expect(MEAL_LABELS[meal]).toBeTruthy()
  })

  it.each([
    [6, 'breakfast'],
    [9, 'breakfast'],
    [10, 'lunch'],
    [14, 'lunch'],
    [15, 'snack'],
    [17, 'snack'],
    [18, 'dinner'],
    [23, 'dinner'],
  ])('guesses the meal at %i:00 as %s', (hour, meal) => {
    expect(guessMeal(at(hour))).toBe(meal)
  })
})
