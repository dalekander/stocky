import { ref } from 'vue'
import { defineStore } from 'pinia'
import * as entriesService from '@/services/entriesService'
import { useAuthStore } from '@/stores/auth'
import { entryCalories } from '@/utils/calories'

/** @typedef {import('@/utils/calories').Entry} Entry */

export const useEntriesStore = defineStore('entries', () => {
  const auth = useAuthStore()

  /** Entries for `loadedDate`. @type {import('vue').Ref<Entry[]>} */
  const entries = ref([])
  const loadedDate = ref('')
  /** Entries for the last loaded range (used by the weekly chart). @type {import('vue').Ref<Entry[]>} */
  const rangeEntries = ref([])
  const isLoading = ref(false)
  const error = ref('')
  let latestRequest = 0

  async function load(date) {
    const requestId = ++latestRequest
    isLoading.value = true
    error.value = ''
    try {
      const result = await entriesService.listEntriesByDate(auth.requireUid(), date)
      if (requestId !== latestRequest) return
      entries.value = result
      loadedDate.value = date
    } catch {
      if (requestId !== latestRequest) return
      error.value = 'Could not load this day. Please try again.'
    } finally {
      if (requestId === latestRequest) isLoading.value = false
    }
  }

  async function loadRange(start, end) {
    const requestId = ++latestRequest
    isLoading.value = true
    error.value = ''
    try {
      const result = await entriesService.listEntriesInRange(auth.requireUid(), start, end)
      if (requestId !== latestRequest) return
      rangeEntries.value = result
    } catch {
      if (requestId !== latestRequest) return
      error.value = 'Could not load your week. Please try again.'
    } finally {
      if (requestId === latestRequest) isLoading.value = false
    }
  }

  /**
   * @param {{ date: string, meal: string, food: import('@/services/foodsService').Food, servings: number }} input
   */
  async function add({ date, meal, food, servings }) {
    const entry = await entriesService.addEntry(auth.requireUid(), {
      date,
      meal,
      foodId: food.id,
      foodName: food.name,
      servingLabel: food.servingLabel,
      caloriesPerServing: food.calories,
      servings,
      totalCalories: entryCalories(food.calories, servings),
      createdAt: Date.now(),
    })
    if (date === loadedDate.value) entries.value.push(entry)
    return entry
  }

  /** @param {string} id @param {{ meal: string, servings: number }} input */
  async function update(id, { meal, servings }) {
    const entry = entries.value.find((item) => item.id === id)
    if (!entry) return
    const totalCalories = entryCalories(entry.caloriesPerServing, servings)
    await entriesService.updateEntry(auth.requireUid(), id, { meal, servings, totalCalories })
    Object.assign(entry, { meal, servings, totalCalories })
  }

  async function remove(id) {
    await entriesService.deleteEntry(auth.requireUid(), id)
    entries.value = entries.value.filter((entry) => entry.id !== id)
  }

  function reset() {
    entries.value = []
    rangeEntries.value = []
    loadedDate.value = ''
    error.value = ''
  }

  return {
    entries,
    loadedDate,
    rangeEntries,
    isLoading,
    error,
    load,
    loadRange,
    add,
    update,
    remove,
    reset,
  }
})
