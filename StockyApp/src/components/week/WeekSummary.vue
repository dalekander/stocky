<script setup>
import { onMounted } from 'vue'
import { useWeek } from '@/composables/useWeek'
import { formatCalories } from '@/utils/calories'
import { toDateKey } from '@/utils/date'
import BaseButton from '@/components/base/BaseButton.vue'
import BaseSpinner from '@/components/base/BaseSpinner.vue'
import CalorieBarChart from '@/components/week/CalorieBarChart.vue'

defineEmits(['select'])

const { days, hasData, average, isLoading, error, load } = useWeek()

onMounted(load)
</script>

<template>
  <section class="rounded-2xl bg-white p-4 shadow-sm" aria-label="This week">
    <h2 class="text-sm font-medium text-slate-600">This week</h2>

    <div v-if="error" role="alert" class="mt-2 text-sm text-red-700">
      <p>{{ error }}</p>
      <BaseButton variant="secondary" class="mt-3" @click="load">Try again</BaseButton>
    </div>

    <div v-else-if="isLoading" class="flex justify-center py-6 text-brand-600"><BaseSpinner /></div>

    <template v-else>
      <p class="mt-1 text-2xl font-bold">
        {{ formatCalories(average) }}
        <span class="text-sm font-medium text-slate-500">kcal / day average</span>
      </p>
      <p v-if="!hasData" class="mt-1 text-sm text-slate-500">
        No entries in the last 7 days. Log some food and your week shows up here.
      </p>

      <div class="mt-4">
        <CalorieBarChart
          :days="days"
          :selected-date="toDateKey()"
          @select="$emit('select', $event)"
        />
      </div>
      <p class="mt-3 text-center text-xs text-slate-500">Tap a bar to open that day.</p>
    </template>
  </section>
</template>
