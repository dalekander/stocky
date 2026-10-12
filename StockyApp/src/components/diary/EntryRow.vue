<script setup>
import { formatCalories } from '@/utils/calories'

defineProps({
  entry: { type: Object, required: true },
})

defineEmits(['select'])
</script>

<template>
  <button
    type="button"
    class="flex min-h-14 w-full items-center justify-between gap-3 px-4 py-2 text-left hover:bg-slate-50"
    @click="$emit('select', entry)"
  >
    <span class="min-w-0">
      <span class="block truncate text-base font-medium">{{ entry.foodName }}</span>
      <span class="block truncate text-sm text-slate-500">
        {{ entry.servings }} × {{ entry.servingLabel || 'serving' }}
      </span>
    </span>
    <span class="shrink-0 text-base font-semibold">{{ formatCalories(entry.totalCalories) }}</span>
  </button>
</template>
