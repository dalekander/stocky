export const GENDERS = [
  { value: 'female', label: 'Female' },
  { value: 'male', label: 'Male' },
]

export const ACTIVITY_LEVELS = [
  { value: 'sedentary', label: 'Sedentary', hint: 'Little or no exercise', factor: 1.2 },
  { value: 'light', label: 'Lightly active', hint: 'Exercise 1–3 days a week', factor: 1.375 },
  { value: 'moderate', label: 'Moderately active', hint: 'Exercise 3–5 days a week', factor: 1.55 },
  { value: 'active', label: 'Very active', hint: 'Hard exercise 6–7 days a week', factor: 1.725 },
]

/** Weekly weight-change slider: negative = lose, positive = gain (lb per week). */
export const GOAL_RATE = { min: -2, max: 2, step: 0.5, default: -1 }

export const AGE_LIMITS = { min: 18, max: 100 }
export const HEIGHT_LIMITS_IN = { min: 48, max: 96 }
export const WEIGHT_LIMITS_LB = { min: 66, max: 660 }
