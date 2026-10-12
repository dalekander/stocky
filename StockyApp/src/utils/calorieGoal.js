import { ACTIVITY_LEVELS } from '@/constants/profile'

/** Approximate energy in one pound of body weight. */
export const KCAL_PER_LB = 3500

/** Safety floors so a plan never drops to an unhealthy intake. */
export const MIN_DAILY_CALORIES = { male: 1500, female: 1200 }

const KG_PER_LB = 0.45359237
const CM_PER_IN = 2.54

/**
 * @typedef {Object} BodyDetails
 * @property {'male'|'female'} gender
 * @property {number} age years
 * @property {number} heightIn total inches
 * @property {number} weightLb pounds
 * @property {'sedentary'|'light'|'moderate'|'active'} activityLevel
 */

/**
 * Basal metabolic rate, Mifflin-St Jeor equation.
 * @param {BodyDetails} details
 */
export function basalMetabolicRate({ gender, age, heightIn, weightLb }) {
  const base = 10 * (weightLb * KG_PER_LB) + 6.25 * (heightIn * CM_PER_IN) - 5 * age
  return base + (gender === 'male' ? 5 : -161)
}

/**
 * Calories to maintain current weight.
 * @param {BodyDetails} details
 */
export function maintenanceCalories(details) {
  const level = ACTIVITY_LEVELS.find((item) => item.value === details.activityLevel)
  return Math.round(basalMetabolicRate(details) * (level?.factor ?? 1.2))
}

/**
 * Daily calorie target for a weekly weight change.
 * @param {BodyDetails} details
 * @param {number} rateLbPerWeek negative to lose, positive to gain
 * @returns {{ maintenance: number, target: number, isClamped: boolean, effectiveRate: number }}
 */
export function dailyTarget(details, rateLbPerWeek) {
  const maintenance = maintenanceCalories(details)
  const wanted = maintenance + (rateLbPerWeek * KCAL_PER_LB) / 7
  const floor = MIN_DAILY_CALORIES[details.gender] ?? MIN_DAILY_CALORIES.female
  const target = Math.round(Math.max(wanted, floor))
  const effectiveRate = Math.round((((target - maintenance) * 7) / KCAL_PER_LB) * 100) / 100

  return { maintenance, target, isClamped: wanted < floor, effectiveRate }
}

/** @param {number} rate lb per week, signed */
export function describeRate(rate) {
  if (rate === 0) return 'Maintain weight'
  const amount = Math.abs(rate)
  return `${rate < 0 ? 'Lose' : 'Gain'} ${amount} lb / week`
}
