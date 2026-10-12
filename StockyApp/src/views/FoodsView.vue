<script setup>
import { onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { ROUTES } from '@/constants/routes'
import { useFoods } from '@/composables/useFoods'
import BaseButton from '@/components/base/BaseButton.vue'
import BaseEmptyState from '@/components/base/BaseEmptyState.vue'
import BaseSpinner from '@/components/base/BaseSpinner.vue'
import FoodListItem from '@/components/foods/FoodListItem.vue'

const router = useRouter()
const { foods, isLoading, error, load } = useFoods()

onMounted(() => load())

const edit = (id) => router.push({ name: ROUTES.FOOD_EDIT, params: { id } })
</script>

<template>
  <div class="space-y-4">
    <BaseButton block @click="edit('new')">New food</BaseButton>

    <div v-if="isLoading" class="flex justify-center py-6 text-brand-600"><BaseSpinner /></div>

    <div v-else-if="error" role="alert" class="rounded-2xl bg-red-50 p-4 text-sm text-red-700">
      <p>{{ error }}</p>
      <BaseButton variant="secondary" class="mt-3" @click="load({ force: true })"
        >Try again</BaseButton
      >
    </div>

    <BaseEmptyState
      v-else-if="foods.length === 0"
      title="No saved foods yet"
      description="Foods you create are saved here so you can add them again any day."
    />

    <ul v-else class="divide-y divide-slate-100 overflow-hidden rounded-2xl bg-white shadow-sm">
      <li v-for="food in foods" :key="food.id">
        <FoodListItem :food="food" @select="edit(food.id)" />
      </li>
    </ul>
  </div>
</template>
