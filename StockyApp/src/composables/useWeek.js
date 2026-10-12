import { computed } from 'vue'
import { useEntriesStore } from '@/stores/entries'
import { totalFor } from '@/utils/calories'
import { formatWeekday, weekRange } from '@/utils/date'

/** Calorie totals for the last 7 days (ending today). */
export function useWeek() {
  const store = useEntriesStore()

  const days = computed(() =>
    weekRange().map((date) => ({
      date,
      label: formatWeekday(date),
      calories: totalFor(store.rangeEntries.filter((entry) => entry.date === date)),
    })),
  )

  const loggedDays = computed(() => days.value.filter((day) => day.calories > 0))
  const hasData = computed(() => loggedDays.value.length > 0)
  const average = computed(() =>
    hasData.value
      ? totalFor(loggedDays.value.map((d) => ({ totalCalories: d.calories }))) /
        loggedDays.value.length
      : 0,
  )

  function load() {
    const range = weekRange()
    return store.loadRange(range[0], range[range.length - 1])
  }

  return {
    days,
    hasData,
    average,
    isLoading: computed(() => store.isLoading),
    error: computed(() => store.error),
    load,
  }
}
