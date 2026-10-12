<script setup>
import { computed, onMounted, ref } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { MEALS, guessMeal } from '@/constants/meals'
import { ROUTES } from '@/constants/routes'
import { useFoods } from '@/composables/useFoods'
import { useFoodSearch } from '@/composables/useFoodSearch'
import { useSelectedDate } from '@/composables/useSelectedDate'
import { formatDateLabel } from '@/utils/date'
import BaseButton from '@/components/base/BaseButton.vue'
import BaseEmptyState from '@/components/base/BaseEmptyState.vue'
import BaseSpinner from '@/components/base/BaseSpinner.vue'
import FoodForm from '@/components/foods/FoodForm.vue'
import FoodListItem from '@/components/foods/FoodListItem.vue'
import FoodSearch from '@/components/foods/FoodSearch.vue'
import LogFoodSheet from '@/components/foods/LogFoodSheet.vue'

const route = useRoute()
const router = useRouter()
const { date } = useSelectedDate()
const { foods, isLoading, error, load, createFood, logFood } = useFoods()

const defaultMeal = MEALS.includes(route.query.meal) ? route.query.meal : guessMeal()
const query = ref('')
const isCreating = ref(false)
const selectedFood = ref(null)
const isSaving = ref(false)
const actionError = ref('')

const { results, isSearching } = useFoodSearch(query)
const existingNames = computed(() => foods.value.map((food) => food.name))
const dateLabel = computed(() => formatDateLabel(date.value))

// Always refresh from Firestore when the page opens so the list is current.
onMounted(() => load({ force: true }))

function openLogSheet(food) {
  actionError.value = ''
  selectedFood.value = food
}

async function onCreate(values) {
  isSaving.value = true
  actionError.value = ''
  try {
    const food = await createFood(values)
    isCreating.value = false
    openLogSheet(food)
  } catch {
    actionError.value = 'Could not save this food. Please try again.'
  } finally {
    isSaving.value = false
  }
}

async function onConfirm({ servings, meal }) {
  isSaving.value = true
  actionError.value = ''
  try {
    await logFood(selectedFood.value, { date: date.value, meal, servings })
    await router.replace({ name: ROUTES.DIARY, query: { date: date.value } })
  } catch {
    actionError.value = 'Could not log this food. Please try again.'
  } finally {
    isSaving.value = false
  }
}
</script>

<template>
  <div class="space-y-4">
    <section v-if="isCreating" class="rounded-2xl bg-white p-4 shadow-sm">
      <h2 class="mb-3 text-base font-semibold">Create a new food</h2>
      <FoodForm
        :existing-names="existingNames"
        submit-label="Save and continue"
        :is-saving="isSaving"
        :error="actionError"
        @submit="onCreate"
      />
      <BaseButton variant="ghost" block class="mt-2" @click="isCreating = false">Cancel</BaseButton>
    </section>

    <template v-else>
      <FoodSearch v-model="query" autofocus />

      <p v-if="error" role="alert" class="rounded-2xl bg-red-50 p-4 text-sm text-red-700">
        {{ error }}
      </p>

      <div
        v-if="(isLoading && foods.length === 0) || (isSearching && results.length === 0)"
        class="flex justify-center py-6 text-brand-600"
      >
        <BaseSpinner />
      </div>

      <BaseEmptyState
        v-else-if="!isLoading && foods.length === 0 && !error"
        title="No saved foods yet"
        description="Create your first food and it will be here next time."
      />

      <BaseEmptyState
        v-else-if="results.length === 0 && foods.length > 0"
        title="No matches"
        :description="`Nothing named “${query.trim()}”. Try creating it.`"
      />

      <ul
        v-else-if="results.length > 0"
        class="divide-y divide-slate-100 overflow-hidden rounded-2xl bg-white shadow-sm"
      >
        <li v-for="food in results" :key="food.id">
          <FoodListItem :food="food" @select="openLogSheet" />
        </li>
      </ul>

      <BaseButton variant="secondary" block @click="isCreating = true">Create new food</BaseButton>
    </template>

    <LogFoodSheet
      :open="Boolean(selectedFood)"
      :food="selectedFood"
      :default-meal="defaultMeal"
      :date-label="dateLabel"
      :is-saving="isSaving"
      :error="actionError"
      @close="selectedFood = null"
      @confirm="onConfirm"
    />
  </div>
</template>
