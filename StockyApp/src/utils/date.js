const pad = (n) => String(n).padStart(2, '0')

/**
 * Format a Date as "YYYY-MM-DD" in the user's local timezone.
 * @param {Date} [date]
 * @returns {string}
 */
export function toDateKey(date = new Date()) {
  return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}`
}

/**
 * @param {string} key "YYYY-MM-DD"
 * @returns {Date} local midnight of that day
 */
export function parseDateKey(key) {
  const [year, month, day] = key.split('-').map(Number)
  return new Date(year, month - 1, day)
}

/** @param {unknown} key */
export function isValidDateKey(key) {
  if (typeof key !== 'string' || !/^\d{4}-\d{2}-\d{2}$/.test(key)) return false
  return toDateKey(parseDateKey(key)) === key
}

/**
 * @param {string} key
 * @param {number} days may be negative
 * @returns {string}
 */
export function addDays(key, days) {
  const date = parseDateKey(key)
  date.setDate(date.getDate() + days)
  return toDateKey(date)
}

/**
 * The 7 day keys ending at `endKey`, oldest first.
 * @param {string} [endKey]
 * @returns {string[]}
 */
export function weekRange(endKey = toDateKey()) {
  return Array.from({ length: 7 }, (_, index) => addDays(endKey, index - 6))
}

/**
 * Human label such as "Today", "Yesterday" or "Mon, 12 Oct".
 * @param {string} key
 * @param {string} [todayKey]
 */
export function formatDateLabel(key, todayKey = toDateKey()) {
  if (key === todayKey) return 'Today'
  if (key === addDays(todayKey, -1)) return 'Yesterday'
  if (key === addDays(todayKey, 1)) return 'Tomorrow'
  return parseDateKey(key).toLocaleDateString('en-US', {
    weekday: 'short',
    day: 'numeric',
    month: 'short',
  })
}

/** @param {string} key e.g. "Mon" */
export function formatWeekday(key) {
  return parseDateKey(key).toLocaleDateString('en-US', { weekday: 'short' })
}
