<script setup>
defineProps({
  modelValue: { type: String, default: '' },
  /** @type {import('vue').PropType<{ value: string, label: string }[]>} */
  options: { type: Array, required: true },
  label: { type: String, required: true },
})

defineEmits(['update:modelValue'])
</script>

<template>
  <div
    role="radiogroup"
    :aria-label="label"
    class="grid auto-cols-fr grid-flow-col gap-1 rounded-xl bg-slate-100 p-1"
  >
    <button
      v-for="option in options"
      :key="option.value"
      type="button"
      role="radio"
      :aria-checked="modelValue === option.value"
      :class="[
        'min-h-11 rounded-lg px-1 text-sm font-medium',
        modelValue === option.value ? 'bg-white text-brand-700 shadow-sm' : 'text-slate-600',
      ]"
      @click="$emit('update:modelValue', option.value)"
    >
      {{ option.label }}
    </button>
  </div>
</template>
