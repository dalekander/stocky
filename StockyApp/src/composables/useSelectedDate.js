import { computed } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { isValidDateKey, toDateKey } from '@/utils/date'

/**
 * The currently selected day, kept in the `?date=` query param so it survives
 * navigation (e.g. Diary → Add Food → Diary) and can be linked to.
 */
export function useSelectedDate() {
  const route = useRoute()
  const router = useRouter()

  const date = computed({
    get: () => (isValidDateKey(route.query.date) ? route.query.date : toDateKey()),
    set: (value) => {
      const isToday = value === toDateKey()
      router.replace({ query: { ...route.query, date: isToday ? undefined : value } })
    },
  })

  const isToday = computed(() => date.value === toDateKey())

  return { date, isToday }
}
