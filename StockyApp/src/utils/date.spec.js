import { describe, expect, it } from 'vitest'
import {
  addDays,
  formatDateLabel,
  formatWeekday,
  isValidDateKey,
  parseDateKey,
  toDateKey,
  weekRange,
} from '@/utils/date'

describe('toDateKey / parseDateKey', () => {
  it('formats a local date as YYYY-MM-DD with zero padding', () => {
    expect(toDateKey(new Date(2026, 0, 5))).toBe('2026-01-05')
    expect(toDateKey(new Date(2026, 11, 31))).toBe('2026-12-31')
  })

  it('round-trips through parseDateKey at local midnight', () => {
    const date = parseDateKey('2026-10-12')
    expect([date.getFullYear(), date.getMonth(), date.getDate()]).toEqual([2026, 9, 12])
    expect(date.getHours()).toBe(0)
    expect(toDateKey(date)).toBe('2026-10-12')
  })
})

describe('isValidDateKey', () => {
  it('accepts real calendar dates', () => {
    expect(isValidDateKey('2026-10-12')).toBe(true)
    expect(isValidDateKey('2028-02-29')).toBe(true)
  })

  it.each([
    '2026-02-30',
    '2027-02-29',
    '2026-13-01',
    '2026-1-5',
    'abc',
    '',
    null,
    undefined,
    20261012,
  ])('rejects %s', (value) => {
    expect(isValidDateKey(value)).toBe(false)
  })
})

describe('addDays', () => {
  it('moves across month and year boundaries', () => {
    expect(addDays('2026-10-31', 1)).toBe('2026-11-01')
    expect(addDays('2026-12-31', 1)).toBe('2027-01-01')
    expect(addDays('2026-01-01', -1)).toBe('2025-12-31')
  })

  it('handles leap days', () => {
    expect(addDays('2028-03-01', -1)).toBe('2028-02-29')
    expect(addDays('2027-03-01', -1)).toBe('2027-02-28')
  })

  it('returns the same day for 0', () => {
    expect(addDays('2026-10-12', 0)).toBe('2026-10-12')
  })
})

describe('weekRange', () => {
  it('returns 7 consecutive days ending on the given day, oldest first', () => {
    const range = weekRange('2026-10-10')
    expect(range).toHaveLength(7)
    expect(range[0]).toBe('2026-10-04')
    expect(range[6]).toBe('2026-10-10')
  })

  it('spans a month boundary', () => {
    expect(weekRange('2026-11-02')[0]).toBe('2026-10-27')
  })
})

describe('formatDateLabel', () => {
  const today = '2026-10-12'

  it('uses Today, Yesterday and Tomorrow for adjacent days', () => {
    expect(formatDateLabel('2026-10-12', today)).toBe('Today')
    expect(formatDateLabel('2026-10-11', today)).toBe('Yesterday')
    expect(formatDateLabel('2026-10-13', today)).toBe('Tomorrow')
  })

  it('falls back to a short weekday, day and month', () => {
    const label = formatDateLabel('2026-10-05', today)
    expect(label).toContain('Mon')
    expect(label).toContain('Oct')
    expect(label).toContain('5')
  })
})

describe('formatWeekday', () => {
  it('returns the short weekday name', () => {
    expect(formatWeekday('2026-10-12')).toBe('Mon')
    expect(formatWeekday('2026-10-18')).toBe('Sun')
  })
})
