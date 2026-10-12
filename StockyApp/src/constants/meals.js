export const MEALS = ['breakfast', 'lunch', 'dinner', 'snack']

export const MEAL_LABELS = {
  breakfast: 'Breakfast',
  lunch: 'Lunch',
  dinner: 'Dinner',
  snack: 'Snacks',
}

/**
 * Pick a sensible default meal for the time of day.
 * @param {Date} [now]
 * @returns {'breakfast'|'lunch'|'dinner'|'snack'}
 */
export function guessMeal(now = new Date()) {
  const hour = now.getHours()
  if (hour < 10) return 'breakfast'
  if (hour < 15) return 'lunch'
  if (hour < 18) return 'snack'
  return 'dinner'
}
