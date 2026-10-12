import { describe, expect, it } from 'vitest'
import {
  DEFAULT_SERVING_LABEL,
  LIMITS,
  validateCredentials,
  validateFood,
  validateProfile,
  validateServings,
} from '@/utils/validators'

describe('validateFood', () => {
  it('accepts valid input and normalises it', () => {
    const result = validateFood({ name: '  Oatmeal ', calories: '150', servingLabel: ' 1 cup ' })
    expect(result.ok).toBe(true)
    expect(result.values).toEqual({ name: 'Oatmeal', calories: 150, servingLabel: '1 cup' })
  })

  it('defaults an empty serving label', () => {
    const result = validateFood({ name: 'Egg', calories: 70, servingLabel: '   ' })
    expect(result.ok).toBe(true)
    expect(result.values.servingLabel).toBe(DEFAULT_SERVING_LABEL)
  })

  it('allows 0 calories', () => {
    expect(validateFood({ name: 'Water', calories: '0', servingLabel: '' }).ok).toBe(true)
  })

  it('requires a name', () => {
    const result = validateFood({ name: '  ', calories: 10, servingLabel: '' })
    expect(result.ok).toBe(false)
    expect(result.errors.name).toBeTruthy()
  })

  it('rejects a name that is too long', () => {
    const result = validateFood({ name: 'a'.repeat(LIMITS.NAME_MAX + 1), calories: 10 })
    expect(result.errors.name).toBeTruthy()
  })

  it.each([
    ['', 'empty'],
    ['abc', 'not a number'],
    ['-5', 'negative'],
    ['100001', 'too large'],
  ])('rejects calories %j (%s)', (calories) => {
    const result = validateFood({ name: 'Food', calories, servingLabel: '' })
    expect(result.ok).toBe(false)
    expect(result.errors.calories).toBeTruthy()
  })

  it('rejects an over-long serving label', () => {
    const servingLabel = 'x'.repeat(LIMITS.SERVING_LABEL_MAX + 1)
    expect(
      validateFood({ name: 'Food', calories: 1, servingLabel }).errors.servingLabel,
    ).toBeTruthy()
  })
})

describe('validateServings', () => {
  it('accepts positive decimals', () => {
    expect(validateServings(0.5)).toBe('')
    expect(validateServings(3)).toBe('')
  })

  it.each([0, -1, NaN, Infinity, LIMITS.SERVINGS_MAX + 1])('rejects %s', (value) => {
    expect(validateServings(value)).not.toBe('')
  })
})

describe('validateCredentials', () => {
  it('accepts a valid email and password', () => {
    expect(validateCredentials('a@b.co', 'secret1')).toBe('')
  })

  it('rejects a bad email', () => {
    expect(validateCredentials('not-an-email', 'secret1')).toMatch(/email/i)
  })

  it('rejects a short password', () => {
    expect(validateCredentials('a@b.co', '123')).toMatch(/password/i)
  })
})

describe('validateProfile', () => {
  const valid = {
    gender: 'female',
    age: '30',
    feet: '5',
    inches: '8',
    weightLb: '165.44',
    activityLevel: 'light',
  }

  it('accepts valid details and converts height to inches', () => {
    const result = validateProfile(valid)
    expect(result.ok).toBe(true)
    expect(result.values).toEqual({
      gender: 'female',
      age: 30,
      heightIn: 68,
      weightLb: 165.4,
      activityLevel: 'light',
    })
  })

  it('treats empty inches as 0', () => {
    const result = validateProfile({ ...valid, inches: '' })
    expect(result.ok).toBe(true)
    expect(result.values.heightIn).toBe(60)
  })

  it('requires a gender', () => {
    expect(validateProfile({ ...valid, gender: '' }).errors.gender).toBeTruthy()
  })

  it('requires adults only', () => {
    expect(validateProfile({ ...valid, age: '17' }).errors.age).toMatch(/18/)
    expect(validateProfile({ ...valid, age: '18' }).ok).toBe(true)
  })

  it('requires a whole-number age', () => {
    expect(validateProfile({ ...valid, age: '30.5' }).errors.age).toBeTruthy()
    expect(validateProfile({ ...valid, age: '' }).errors.age).toBeTruthy()
  })

  it('rejects inches outside 0-11 and heights outside 4-8 ft', () => {
    expect(validateProfile({ ...valid, inches: '12' }).errors.height).toBeTruthy()
    expect(validateProfile({ ...valid, feet: '3', inches: '0' }).errors.height).toBeTruthy()
    expect(validateProfile({ ...valid, feet: '9', inches: '0' }).errors.height).toBeTruthy()
  })

  it('rejects an out-of-range weight', () => {
    expect(validateProfile({ ...valid, weightLb: '30' }).errors.weightLb).toBeTruthy()
    expect(validateProfile({ ...valid, weightLb: '' }).errors.weightLb).toBeTruthy()
  })

  it('requires a known activity level', () => {
    expect(
      validateProfile({ ...valid, activityLevel: 'extreme' }).errors.activityLevel,
    ).toBeTruthy()
  })
})
