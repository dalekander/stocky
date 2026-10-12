import { MEALS } from '@/constants/meals'

/**
 * @typedef {Object} Entry
 * @property {string} id
 * @property {string} date "YYYY-MM-DD"
 * @property {'breakfast'|'lunch'|'dinner'|'snack'} meal
 * @property {string} foodId
 * @property {string} foodName snapshot at log time
 * @property {string} servingLabel snapshot at log time
 * @property {number} caloriesPerServing snapshot at log time
 * @property {number} servings
 * @property {number} totalCalories
 * @property {number} createdAt epoch ms
 */

/**
 * @param {number} caloriesPerServing
 * @param {number} servings
 * @returns {number} whole calories
 */
export function entryCalories(caloriesPerServing, servings) {
  return Math.round(caloriesPerServing * servings)
}

/** @param {Pick<Entry, 'totalCalories'>[]} entries */
export function totalFor(entries) {
  return entries.reduce((sum, entry) => sum + entry.totalCalories, 0)
}

/**
 * @param {Entry[]} entries
 * @returns {Record<string, number>} calories keyed by meal
 */
export function sumByMeal(entries) {
  const sums = Object.fromEntries(MEALS.map((meal) => [meal, 0]))
  for (const entry of entries) {
    if (entry.meal in sums) sums[entry.meal] += entry.totalCalories
  }
  return sums
}

/** @param {number} value */
export function formatCalories(value) {
  return Math.round(value).toLocaleString('en-US')
}
