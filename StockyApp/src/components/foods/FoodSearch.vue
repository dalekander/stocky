<script setup>
import { onMounted, ref } from 'vue'

const props = defineProps({
  modelValue: { type: String, default: '' },
  placeholder: { type: String, default: 'Search your foods' },
  autofocus: { type: Boolean, default: false },
})

defineEmits(['update:modelValue'])

const input = ref(null)

onMounted(() => {
  if (props.autofocus) input.value?.focus()
})
</script>

<template>
  <div class="relative">
    <svg
      viewBox="0 0 24 24"
      class="pointer-events-none absolute top-1/2 left-3 h-5 w-5 -translate-y-1/2 text-slate-400"
      fill="none"
      stroke="currentColor"
      stroke-width="2"
      aria-hidden="true"
    >
      <circle cx="11" cy="11" r="7" />
      <path d="M20 20l-3.5-3.5" stroke-linecap="round" />
    </svg>
    <input
      ref="input"
      type="search"
      :value="modelValue"
      :placeholder="placeholder"
      aria-label="Search foods"
      autocomplete="off"
      class="block min-h-11 w-full rounded-xl border border-slate-300 bg-white pr-3 pl-10 text-base placeholder:text-slate-400"
      @input="$emit('update:modelValue', $event.target.value)"
    />
  </div>
</template>
