<script setup>
import { computed } from 'vue'
import { formatCalories } from '@/utils/calories'

const props = defineProps({
  total: { type: Number, required: true },
  entryCount: { type: Number, default: 0 },
  /** Daily calorie target; null when unknown. */
  goal: { type: Number, default: null },
})

const remaining = computed(() => (props.goal === null ? null : props.goal - props.total))
const progress = computed(() =>
  props.goal ? Math.min(100, Math.round((props.total / props.goal) * 100)) : 0,
)
</script>

<template>
  <section class="rounded-2xl bg-brand-600 p-5 text-white shadow-sm" aria-label="Day total">
    <p class="text-sm text-brand-100">Total for the day</p>
    <p class="mt-1 text-4xl font-bold">
      {{ formatCalories(total) }}
      <span class="text-lg font-medium text-brand-100">kcal</span>
    </p>

    <template v-if="remaining !== null">
      <div
        class="mt-3 h-2 overflow-hidden rounded-full bg-brand-700"
        role="progressbar"
        :aria-valuenow="progress"
        aria-valuemin="0"
        aria-valuemax="100"
        aria-label="Progress toward daily target"
      >
        <div class="h-full rounded-full bg-white" :style="{ width: `${progress}%` }" />
      </div>
      <p class="mt-2 text-sm text-brand-100">
        <template v-if="remaining >= 0">
          {{ formatCalories(remaining) }} kcal left of {{ formatCalories(goal) }}
        </template>
        <template v-else>
          {{ formatCalories(-remaining) }} kcal over your {{ formatCalories(goal) }} target
        </template>
      </p>
    </template>

    <p class="mt-1 text-sm text-brand-100">
      {{ entryCount === 1 ? '1 item logged' : `${entryCount} items logged` }}
    </p>
  </section>
</template>
