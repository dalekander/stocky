<script setup>
import { formatCalories } from '@/utils/calories'

defineProps({
  food: { type: Object, required: true },
})

defineEmits(['select'])
</script>

<template>
  <div class="flex items-center">
    <button
      type="button"
      class="flex min-h-14 min-w-0 flex-1 items-center justify-between gap-3 px-4 py-2 text-left hover:bg-slate-50"
      @click="$emit('select', food)"
    >
      <span class="min-w-0">
        <span class="block truncate text-base font-medium">{{ food.name }}</span>
        <span class="block truncate text-sm text-slate-500">{{ food.servingLabel }}</span>
      </span>
      <span class="shrink-0 text-base font-semibold">{{ formatCalories(food.calories) }} kcal</span>
    </button>
    <slot name="trailing" />
  </div>
</template>
