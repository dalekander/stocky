<script setup>
import { computed } from 'vue'
import { addDays, formatDateLabel, isValidDateKey, toDateKey } from '@/utils/date'

const props = defineProps({
  modelValue: { type: String, required: true },
})

const emit = defineEmits(['update:modelValue'])

const label = computed(() => formatDateLabel(props.modelValue))
const isToday = computed(() => props.modelValue === toDateKey())

function onPick(event) {
  const value = event.target.value
  if (isValidDateKey(value)) emit('update:modelValue', value)
}
</script>

<template>
  <div class="flex items-center justify-between rounded-2xl bg-white p-1 shadow-sm">
    <button
      type="button"
      class="flex h-11 w-11 items-center justify-center rounded-xl text-slate-700 hover:bg-slate-100"
      aria-label="Previous day"
      @click="emit('update:modelValue', addDays(modelValue, -1))"
    >
      <svg viewBox="0 0 24 24" class="h-5 w-5" fill="none" stroke="currentColor" stroke-width="2">
        <path d="M15 19l-7-7 7-7" stroke-linecap="round" stroke-linejoin="round" />
      </svg>
    </button>

    <div class="relative flex flex-col items-center">
      <span class="text-base font-semibold">{{ label }}</span>
      <button
        v-if="!isToday"
        type="button"
        class="text-xs font-medium text-brand-700"
        @click="emit('update:modelValue', toDateKey())"
      >
        Jump to today
      </button>
      <input
        type="date"
        :value="modelValue"
        class="absolute inset-x-0 top-0 h-6 w-full cursor-pointer opacity-0"
        aria-label="Pick a date"
        @change="onPick"
      />
    </div>

    <button
      type="button"
      class="flex h-11 w-11 items-center justify-center rounded-xl text-slate-700 hover:bg-slate-100"
      aria-label="Next day"
      @click="emit('update:modelValue', addDays(modelValue, 1))"
    >
      <svg viewBox="0 0 24 24" class="h-5 w-5" fill="none" stroke="currentColor" stroke-width="2">
        <path d="M9 5l7 7-7 7" stroke-linecap="round" stroke-linejoin="round" />
      </svg>
    </button>
  </div>
</template>
