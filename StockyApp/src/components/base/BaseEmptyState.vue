<script setup>
defineProps({
  title: { type: String, required: true },
  description: { type: String, default: '' },
})
</script>

<template>
  <div
    class="flex flex-col items-center rounded-2xl border border-dashed border-slate-300 px-6 py-10 text-center"
  >
    <h2 class="text-base font-semibold text-slate-800">{{ title }}</h2>
    <p v-if="description" class="mt-1 text-sm text-slate-600">{{ description }}</p>
    <div v-if="$slots.default" class="mt-4">
      <slot />
    </div>
  </div>
</template>
