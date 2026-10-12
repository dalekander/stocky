<script setup>
import { computed } from 'vue'
import { formatCalories } from '@/utils/calories'

const props = defineProps({
  /** @type {import('vue').PropType<{ date: string, label: string, calories: number }[]>} */
  days: { type: Array, required: true },
  selectedDate: { type: String, default: '' },
})

defineEmits(['select'])

const max = computed(() => Math.max(1, ...props.days.map((day) => day.calories)))

const barHeight = (calories) => `${Math.max(calories > 0 ? 4 : 0, (calories / max.value) * 100)}%`
</script>

<template>
  <ul class="flex h-52 items-end gap-2" aria-label="Calories per day">
    <li v-for="day in days" :key="day.date" class="flex h-full min-w-0 flex-1">
      <button
        type="button"
        class="flex h-full w-full flex-col items-center justify-end gap-1 rounded-lg"
        :aria-label="`${day.label}: ${formatCalories(day.calories)} calories. Open this day.`"
        @click="$emit('select', day.date)"
      >
        <span class="text-[11px] font-medium text-slate-600">
          {{ day.calories > 0 ? formatCalories(day.calories) : '' }}
        </span>
        <span class="flex w-full flex-1 items-end">
          <span
            :class="[
              'w-full rounded-t-lg',
              day.date === selectedDate ? 'bg-brand-600' : 'bg-brand-500/60',
            ]"
            :style="{ height: barHeight(day.calories) }"
          />
        </span>
        <span class="text-xs text-slate-600">{{ day.label }}</span>
      </button>
    </li>
  </ul>
</template>
