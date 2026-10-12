import {
  ACTIVITY_LEVELS,
  AGE_LIMITS,
  GENDERS,
  HEIGHT_LIMITS_IN,
  WEIGHT_LIMITS_LB,
} from '@/constants/profile'

export const LIMITS = {
  NAME_MAX: 100,
  SERVING_LABEL_MAX: 50,
  CALORIES_MAX: 100000,
  SERVINGS_MAX: 1000,
}

export const DEFAULT_SERVING_LABEL = '1 serving'

/**
 * @typedef {Object} FoodInput
 * @property {string} name
 * @property {string|number} calories
 * @property {string} servingLabel
 */

/**
 * Validate and normalise food form input.
 * @param {FoodInput} input
 * @returns {{ ok: boolean, errors: Record<string, string>, values: { name: string, calories: number, servingLabel: string } }}
 */
export function validateFood(input) {
  const errors = {}
  const name = String(input.name ?? '').trim()
  const servingLabel = String(input.servingLabel ?? '').trim() || DEFAULT_SERVING_LABEL
  const rawCalories = String(input.calories ?? '').trim()
  const calories = rawCalories === '' ? NaN : Number(rawCalories)

  if (!name) errors.name = 'Enter a name for this food.'
  else if (name.length > LIMITS.NAME_MAX)
    errors.name = `Keep the name under ${LIMITS.NAME_MAX} characters.`

  if (!Number.isFinite(calories)) errors.calories = 'Enter the calories per serving.'
  else if (calories < 0) errors.calories = 'Calories cannot be negative.'
  else if (calories > LIMITS.CALORIES_MAX)
    errors.calories = 'That is too many calories for one serving.'

  if (servingLabel.length > LIMITS.SERVING_LABEL_MAX) {
    errors.servingLabel = `Keep the serving under ${LIMITS.SERVING_LABEL_MAX} characters.`
  }

  return {
    ok: Object.keys(errors).length === 0,
    errors,
    values: { name, calories: Number.isFinite(calories) ? calories : 0, servingLabel },
  }
}

/**
 * @param {number} servings
 * @returns {string} error message, or empty string when valid
 */
export function validateServings(servings) {
  if (!Number.isFinite(servings) || servings <= 0) return 'Servings must be greater than 0.'
  if (servings > LIMITS.SERVINGS_MAX) return 'That is too many servings.'
  return ''
}

const toNumber = (value) => {
  const text = String(value ?? '').trim()
  return text === '' ? NaN : Number(text)
}

/**
 * Validate onboarding body details (height comes as feet + inches).
 * @param {{ gender: string, age: string|number, feet: string|number, inches: string|number, weightLb: string|number, activityLevel: string }} input
 */
export function validateProfile(input) {
  const errors = {}
  const age = toNumber(input.age)
  const feet = toNumber(input.feet)
  const inches = toNumber(input.inches || 0)
  const weightLb = toNumber(input.weightLb)
  const heightIn = feet * 12 + inches

  if (!GENDERS.some((item) => item.value === input.gender)) errors.gender = 'Choose one.'

  if (!Number.isInteger(age)) errors.age = 'Enter your age in whole years.'
  else if (age < AGE_LIMITS.min)
    errors.age = `You must be at least ${AGE_LIMITS.min} to use this plan.`
  else if (age > AGE_LIMITS.max) errors.age = 'Enter a valid age.'

  if (!Number.isInteger(feet) || !Number.isFinite(inches) || inches < 0 || inches >= 12) {
    errors.height = 'Enter feet and inches (inches 0–11).'
  } else if (heightIn < HEIGHT_LIMITS_IN.min || heightIn > HEIGHT_LIMITS_IN.max) {
    errors.height = 'Enter a height between 4 ft and 8 ft.'
  }

  if (!Number.isFinite(weightLb)) errors.weightLb = 'Enter your weight in pounds.'
  else if (weightLb < WEIGHT_LIMITS_LB.min || weightLb > WEIGHT_LIMITS_LB.max) {
    errors.weightLb = `Enter a weight between ${WEIGHT_LIMITS_LB.min} and ${WEIGHT_LIMITS_LB.max} lb.`
  }

  if (!ACTIVITY_LEVELS.some((item) => item.value === input.activityLevel)) {
    errors.activityLevel = 'Choose your activity level.'
  }

  return {
    ok: Object.keys(errors).length === 0,
    errors,
    values: {
      gender: input.gender,
      age,
      heightIn,
      weightLb: Math.round(weightLb * 10) / 10,
      activityLevel: input.activityLevel,
    },
  }
}

/**
 * @param {string} email
 * @param {string} password
 * @returns {string} error message, or empty string when valid
 */
export function validateCredentials(email, password) {
  if (!/^\S+@\S+\.\S+$/.test(email.trim())) return 'Enter a valid email address.'
  if (password.length < 6) return 'Password must be at least 6 characters.'
  return ''
}
