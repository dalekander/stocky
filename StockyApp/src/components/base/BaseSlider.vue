<script setup>
import { useId } from 'vue'

defineProps({
  modelValue: { type: Number, required: true },
  min: { type: Number, required: true },
  max: { type: Number, required: true },
  step: { type: Number, default: 1 },
  label: { type: String, required: true },
  /** Human-readable value for screen readers, e.g. "Lose 1 lb / week". */
  valueText: { type: String, default: '' },
  minLabel: { type: String, default: '' },
  maxLabel: { type: String, default: '' },
})

defineEmits(['update:modelValue'])

const id = useId()
</script>

<template>
  <div>
    <label :for="id" class="sr-only">{{ label }}</label>
    <input
      :id="id"
      type="range"
      :value="modelValue"
      :min="min"
      :max="max"
      :step="step"
      :aria-valuetext="valueText || undefined"
      class="h-11 w-full cursor-pointer accent-brand-600"
      @input="$emit('update:modelValue', Number($event.target.value))"
    />
    <div v-if="minLabel || maxLabel" class="flex justify-between text-xs text-slate-500">
      <span>{{ minLabel }}</span>
      <span>{{ maxLabel }}</span>
    </div>
  </div>
</template>
