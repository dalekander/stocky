<script setup>
import { computed, useId } from 'vue'
import { entryCalories, formatCalories } from '@/utils/calories'

const props = defineProps({
  modelValue: { type: Number, required: true },
  caloriesPerServing: { type: Number, required: true },
  servingLabel: { type: String, default: 'serving' },
})

const emit = defineEmits(['update:modelValue'])

const STEP = 0.5
const id = useId()

const total = computed(() => entryCalories(props.caloriesPerServing, props.modelValue))

function set(value) {
  emit('update:modelValue', Math.max(0, Math.round(value * 100) / 100))
}

function onInput(event) {
  const parsed = parseFloat(event.target.value.replace(',', '.'))
  set(Number.isFinite(parsed) ? parsed : 0)
}
</script>

<template>
  <div>
    <label :for="id" class="mb-1 block text-sm font-medium text-slate-700">
      Number of servings ({{ servingLabel }})
    </label>
    <div class="flex items-center gap-2">
      <button
        type="button"
        class="flex h-11 w-11 items-center justify-center rounded-xl border border-slate-300 text-xl"
        aria-label="Decrease servings"
        :disabled="modelValue <= STEP"
        @click="set(modelValue - STEP)"
      >
        −
      </button>
      <input
        :id="id"
        :value="modelValue"
        type="text"
        inputmode="decimal"
        class="min-h-11 w-full rounded-xl border border-slate-300 bg-white px-3 text-center text-base"
        @input="onInput"
      />
      <button
        type="button"
        class="flex h-11 w-11 items-center justify-center rounded-xl border border-slate-300 text-xl"
        aria-label="Increase servings"
        @click="set(modelValue + STEP)"
      >
        +
      </button>
    </div>
    <p class="mt-2 text-center text-sm text-slate-600">
      = <strong class="text-slate-900">{{ formatCalories(total) }} kcal</strong>
    </p>
  </div>
</template>
