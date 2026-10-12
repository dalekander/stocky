<script setup>
import { MEAL_LABELS } from '@/constants/meals'
import { formatCalories } from '@/utils/calories'
import EntryRow from '@/components/diary/EntryRow.vue'

defineProps({
  meal: { type: String, required: true },
  entries: { type: Array, default: () => [] },
  total: { type: Number, default: 0 },
})

defineEmits(['select'])
</script>

<template>
  <section class="overflow-hidden rounded-2xl bg-white shadow-sm" :aria-label="MEAL_LABELS[meal]">
    <header class="flex items-center justify-between px-4 py-3">
      <h2 class="text-base font-semibold">{{ MEAL_LABELS[meal] }}</h2>
      <span class="text-sm font-medium text-slate-600">{{ formatCalories(total) }} kcal</span>
    </header>

    <ul v-if="entries.length" class="divide-y divide-slate-100 border-t border-slate-100">
      <li v-for="entry in entries" :key="entry.id">
        <EntryRow :entry="entry" @select="$emit('select', $event)" />
      </li>
    </ul>
    <p v-else class="border-t border-slate-100 px-4 py-3 text-sm text-slate-500">
      Nothing logged yet.
    </p>
  </section>
</template>
