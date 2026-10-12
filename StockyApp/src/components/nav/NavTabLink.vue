<script setup>
defineProps({
  /** Route location, e.g. `{ name: 'diary' }`. */
  to: { type: Object, required: true },
  label: { type: String, required: true },
  /** SVG path data for a 24x24 stroke icon. */
  icon: { type: String, required: true },
})
</script>

<template>
  <RouterLink
    :to="to"
    class="flex min-h-14 flex-col items-center justify-center gap-0.5 text-xs font-medium text-slate-500"
    active-class="!text-brand-700"
  >
    <svg viewBox="0 0 24 24" class="h-6 w-6" fill="none" stroke="currentColor" stroke-width="2">
      <path :d="icon" stroke-linecap="round" stroke-linejoin="round" />
    </svg>
    {{ label }}
  </RouterLink>
</template>
