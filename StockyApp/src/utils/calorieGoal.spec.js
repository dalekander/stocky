import { describe, expect, it } from 'vitest'
import {
  KCAL_PER_LB,
  MIN_DAILY_CALORIES,
  basalMetabolicRate,
  dailyTarget,
  describeRate,
  maintenanceCalories,
} from '@/utils/calorieGoal'

const woman = { gender: 'female', age: 30, heightIn: 65, weightLb: 165, activityLevel: 'light' }
const man = { gender: 'male', age: 35, heightIn: 70, weightLb: 200, activityLevel: 'moderate' }

describe('basalMetabolicRate (Mifflin-St Jeor)', () => {
  it('matches the formula for a woman', () => {
    // 10*74.84 + 6.25*165.1 - 5*30 - 161
    expect(basalMetabolicRate(woman)).toBeCloseTo(1469.3, 0)
  })

  it('is 166 kcal higher for a man than an otherwise identical woman', () => {
    const same = { age: 30, heightIn: 65, weightLb: 165, activityLevel: 'light' }
    const diff =
      basalMetabolicRate({ ...same, gender: 'male' }) -
      basalMetabolicRate({ ...same, gender: 'female' })
    expect(diff).toBe(166)
  })
})

describe('maintenanceCalories', () => {
  it('applies the activity factor', () => {
    expect(maintenanceCalories(woman)).toBe(2020)
    expect(maintenanceCalories(man)).toBe(2865)
  })

  it('scales with activity level', () => {
    const sedentary = maintenanceCalories({ ...woman, activityLevel: 'sedentary' })
    const active = maintenanceCalories({ ...woman, activityLevel: 'active' })
    expect(active).toBeGreaterThan(sedentary)
  })

  it('falls back to sedentary for an unknown level', () => {
    expect(maintenanceCalories({ ...woman, activityLevel: 'nope' })).toBe(
      maintenanceCalories({ ...woman, activityLevel: 'sedentary' }),
    )
  })
})

describe('dailyTarget', () => {
  it('equals maintenance when maintaining weight', () => {
    const plan = dailyTarget(woman, 0)
    expect(plan.target).toBe(plan.maintenance)
    expect(plan.isClamped).toBe(false)
  })

  it('removes 500 kcal per day for each pound lost per week', () => {
    expect(KCAL_PER_LB / 7).toBe(500)
    expect(dailyTarget(woman, -1).target).toBe(1520)
    expect(dailyTarget(woman, -0.5).target).toBe(1770)
  })

  it('adds calories when gaining', () => {
    expect(dailyTarget(woman, 1).target).toBe(2520)
  })

  it('never goes below the safety floor and reports the real pace', () => {
    const plan = dailyTarget(woman, -2)
    expect(plan.target).toBe(MIN_DAILY_CALORIES.female)
    expect(plan.isClamped).toBe(true)
    expect(plan.effectiveRate).toBeGreaterThan(-2)
    expect(plan.effectiveRate).toBeCloseTo(-1.64, 2)
  })

  it('uses the higher floor for men', () => {
    const smallMan = {
      gender: 'male',
      age: 60,
      heightIn: 60,
      weightLb: 110,
      activityLevel: 'sedentary',
    }
    const plan = dailyTarget(smallMan, -2)
    expect(plan.target).toBe(MIN_DAILY_CALORIES.male)
    expect(plan.isClamped).toBe(true)
  })
})

describe('describeRate', () => {
  it.each([
    [0, 'Maintain weight'],
    [-1, 'Lose 1 lb / week'],
    [-1.5, 'Lose 1.5 lb / week'],
    [0.5, 'Gain 0.5 lb / week'],
  ])('describes %s', (rate, text) => {
    expect(describeRate(rate)).toBe(text)
  })
})
