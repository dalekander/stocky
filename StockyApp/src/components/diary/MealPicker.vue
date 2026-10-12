<script setup>
import { MEALS, MEAL_LABELS } from '@/constants/meals'
import BaseSegmented from '@/components/base/BaseSegmented.vue'

defineProps({
  modelValue: { type: String, required: true },
})

defineEmits(['update:modelValue'])

const options = MEALS.map((meal) => ({ value: meal, label: MEAL_LABELS[meal] }))
</script>

<template>
  <BaseSegmented
    :model-value="modelValue"
    :options="options"
    label="Meal"
    @update:model-value="$emit('update:modelValue', $event)"
  />
</template>
