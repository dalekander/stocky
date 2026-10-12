import { computed } from 'vue'
import { useEntriesStore } from '@/stores/entries'
import { useFoodsStore } from '@/stores/foods'

/** Saved foods: loading, searching, creating, and logging them as diary entries. */
export function useFoods() {
  const foodsStore = useFoodsStore()
  const entriesStore = useEntriesStore()

  /** Log `food` to a meal on a date, and bump it in the recent list. */
  async function logFood(food, { date, meal, servings }) {
    const entry = await entriesStore.add({ date, meal, food, servings })
    await foodsStore.markUsed(food.id)
    return entry
  }

  return {
    foods: computed(() => foodsStore.byRecentlyUsed),
    isLoading: computed(() => foodsStore.isLoading),
    error: computed(() => foodsStore.error),
    load: foodsStore.load,
    getById: foodsStore.getById,
    createFood: foodsStore.add,
    updateFood: foodsStore.update,
    deleteFood: foodsStore.remove,
    logFood,
  }
}
