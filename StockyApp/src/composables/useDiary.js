import { computed, watch } from 'vue'
import { MEALS, MEAL_LABELS } from '@/constants/meals'
import { useSelectedDate } from '@/composables/useSelectedDate'
import { useEntriesStore } from '@/stores/entries'
import { useProfileStore } from '@/stores/profile'
import { totalFor } from '@/utils/calories'

/** The selected day's entries grouped by meal, with totals. */
export function useDiary() {
  const store = useEntriesStore()
  const profile = useProfileStore()
  const { date } = useSelectedDate()

  watch(date, (value) => store.load(value), { immediate: true })

  // Hide the previous day's entries while a new day is loading.
  const entries = computed(() => (store.loadedDate === date.value ? store.entries : []))

  const meals = computed(() =>
    MEALS.map((meal) => {
      const items = entries.value.filter((entry) => entry.meal === meal)
      return { meal, label: MEAL_LABELS[meal], entries: items, total: totalFor(items) }
    }),
  )

  const dayTotal = computed(() => totalFor(entries.value))

  return {
    date,
    meals,
    dayTotal,
    goal: computed(() => profile.calorieTarget),
    entryCount: computed(() => entries.value.length),
    isLoading: computed(() => store.isLoading),
    error: computed(() => store.error),
    reload: () => store.load(date.value),
    updateEntry: store.update,
    removeEntry: store.remove,
  }
}
