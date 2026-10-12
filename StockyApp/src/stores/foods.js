import { computed, ref } from 'vue'
import { defineStore } from 'pinia'
import * as foodsService from '@/services/foodsService'
import { useAuthStore } from '@/stores/auth'

/** @typedef {import('@/services/foodsService').Food} Food */

export const useFoodsStore = defineStore('foods', () => {
  const auth = useAuthStore()

  /** @type {import('vue').Ref<Food[]>} */
  const foods = ref([])
  const isLoading = ref(false)
  const error = ref('')
  let loadedForUid = null

  const byRecentlyUsed = computed(() =>
    [...foods.value].sort((a, b) => b.lastUsedAt - a.lastUsedAt),
  )

  /** Load the user's foods once per signed-in user (pass `force` to refetch). */
  async function load({ force = false } = {}) {
    const uid = auth.requireUid()
    if (!force && loadedForUid === uid) return
    isLoading.value = true
    error.value = ''
    try {
      foods.value = await foodsService.listFoods(uid)
      loadedForUid = uid
    } catch (caught) {
      const reason = caught?.code ?? 'unknown error'
      error.value = `Could not load your foods (${reason}). Please try again.`
    } finally {
      isLoading.value = false
    }
  }

  /** @param {string} id */
  function getById(id) {
    return foods.value.find((food) => food.id === id) ?? null
  }

  /**
   * Prefix search against Firestore for this user's foods. Foods the local
   * list did not have yet are added to it so they behave like any other food.
   * @param {string} term lowercased, trimmed
   */
  async function searchByPrefix(term) {
    const found = await foodsService.searchFoodsByPrefix(auth.requireUid(), term)
    for (const food of found) {
      if (!getById(food.id)) foods.value.push(food)
    }
    return found
  }

  async function add(input) {
    const food = await foodsService.addFood(auth.requireUid(), input)
    foods.value.push(food)
    return food
  }

  async function update(id, input) {
    const changes = await foodsService.updateFood(auth.requireUid(), id, input)
    const food = getById(id)
    if (food) Object.assign(food, changes)
  }

  async function remove(id) {
    await foodsService.deleteFood(auth.requireUid(), id)
    foods.value = foods.value.filter((food) => food.id !== id)
  }

  /** Bump a food to the top of "recent". Failure here must never block logging. */
  async function markUsed(id) {
    try {
      const lastUsedAt = await foodsService.touchFood(auth.requireUid(), id)
      const food = getById(id)
      if (food) food.lastUsedAt = lastUsedAt
    } catch {
      // Non-critical: recency ordering is best-effort.
    }
  }

  function reset() {
    foods.value = []
    error.value = ''
    loadedForUid = null
  }

  return {
    foods,
    isLoading,
    error,
    byRecentlyUsed,
    load,
    getById,
    searchByPrefix,
    add,
    update,
    remove,
    markUsed,
    reset,
  }
})
