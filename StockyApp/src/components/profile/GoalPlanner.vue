<script setup>
import { computed } from 'vue'
import { GOAL_RATE } from '@/constants/profile'
import { describeRate, dailyTarget, MIN_DAILY_CALORIES } from '@/utils/calorieGoal'
import { formatCalories } from '@/utils/calories'
import BaseSlider from '@/components/base/BaseSlider.vue'

const props = defineProps({
  /** @type {import('vue').PropType<import('@/utils/calorieGoal').BodyDetails>} */
  details: { type: Object, required: true },
  /** Weekly change in lb, negative = lose. */
  modelValue: { type: Number, required: true },
})

defineEmits(['update:modelValue'])

const plan = computed(() => dailyTarget(props.details, props.modelValue))
const rateText = computed(() => describeRate(props.modelValue))
const floor = computed(() => MIN_DAILY_CALORIES[props.details.gender])
</script>

<template>
  <section class="space-y-4" aria-label="Your calorie plan">
    <div class="rounded-2xl bg-brand-600 p-5 text-center text-white">
      <p class="text-sm text-brand-100">Your daily target</p>
      <p class="mt-1 text-5xl font-bold" aria-live="polite">{{ formatCalories(plan.target) }}</p>
      <p class="text-base text-brand-100">kcal per day</p>
    </div>

    <div class="rounded-2xl bg-white p-4 shadow-sm">
      <p class="text-center text-lg font-semibold">{{ rateText }}</p>
      <BaseSlider
        :model-value="modelValue"
        :min="GOAL_RATE.min"
        :max="GOAL_RATE.max"
        :step="GOAL_RATE.step"
        label="Weight change per week"
        :value-text="rateText"
        :min-label="`Lose ${Math.abs(GOAL_RATE.min)} lb`"
        :max-label="`Gain ${GOAL_RATE.max} lb`"
        @update:model-value="$emit('update:modelValue', $event)"
      />
      <p class="mt-3 text-center text-sm text-slate-600">
        Maintenance: {{ formatCalories(plan.maintenance) }} kcal/day
      </p>
    </div>

    <p
      v-if="plan.isClamped"
      role="status"
      class="rounded-xl bg-amber-50 p-3 text-sm text-amber-900"
    >
      That pace would go below a safe minimum, so we set your target to
      {{ formatCalories(floor) }} kcal/day. Your real pace will be about
      {{ Math.abs(plan.effectiveRate) }} lb/week.
    </p>

    <p class="text-xs text-slate-500">
      Estimate based on the Mifflin-St Jeor formula (1 lb ≈ 3,500 kcal). It is not medical advice;
      talk to a professional before making big changes.
    </p>
  </section>
</template>
