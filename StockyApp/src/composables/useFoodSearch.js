import { computed, onBeforeUnmount, ref, watch } from 'vue'
import { useFoodsStore } from '@/stores/foods'

const DEBOUNCE_MS = 250

/**
 * Autocomplete over the signed-in user's own foods.
 *
 * Results appear instantly from the loaded list (matching anywhere in the name),
 * and a debounced prefix query against Firestore adds any matches the list
 * does not have yet.
 *
 * @param {import('vue').Ref<string>} query
 */
export function useFoodSearch(query) {
  const store = useFoodsStore()

  const remote = ref([])
  const isSearching = ref(false)
  let timer = null
  let latestRequest = 0

  const term = computed(() => query.value.trim().toLowerCase())

  const local = computed(() => {
    const list = store.byRecentlyUsed
    if (!term.value) return list
    return list.filter((food) => String(food.name).toLowerCase().includes(term.value))
  })

  const results = computed(() => {
    if (!term.value) return local.value
    const known = new Set(local.value.map((food) => food.id))
    return [...local.value, ...remote.value.filter((food) => !known.has(food.id))]
  })

  watch(term, (value) => {
    clearTimeout(timer)
    latestRequest += 1
    remote.value = []

    if (!value) {
      isSearching.value = false
      return
    }

    isSearching.value = true
    const requestId = latestRequest
    timer = setTimeout(async () => {
      try {
        const found = await store.searchByPrefix(value)
        if (requestId === latestRequest) remote.value = found
      } catch {
        // The loaded list already answered; a failed remote search is not fatal.
      } finally {
        if (requestId === latestRequest) isSearching.value = false
      }
    }, DEBOUNCE_MS)
  })

  onBeforeUnmount(() => clearTimeout(timer))

  return { results, isSearching, term }
}
