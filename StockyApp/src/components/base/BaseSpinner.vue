<script setup>
defineProps({
  size: { type: String, default: 'md', validator: (value) => ['sm', 'md'].includes(value) },
  label: { type: String, default: 'Loading' },
})
</script>

<template>
  <span role="status" class="inline-flex items-center justify-center">
    <svg
      viewBox="0 0 24 24"
      fill="none"
      :class="['animate-spin', size === 'sm' ? 'h-4 w-4' : 'h-6 w-6']"
      aria-hidden="true"
    >
      <circle cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4" class="opacity-25" />
      <path d="M4 12a8 8 0 018-8" stroke="currentColor" stroke-width="4" stroke-linecap="round" />
    </svg>
    <span class="sr-only">{{ label }}</span>
  </span>
</template>
