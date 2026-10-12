<script setup>
import { computed, useId } from 'vue'

const props = defineProps({
  modelValue: { type: String, default: '' },
  /** @type {import('vue').PropType<{ value: string, label: string }[]>} */
  options: { type: Array, required: true },
  label: { type: String, required: true },
  hint: { type: String, default: '' },
  error: { type: String, default: '' },
})

defineEmits(['update:modelValue'])

const id = useId()
const messageId = computed(() => `${id}-message`)
const message = computed(() => props.error || props.hint)
</script>

<template>
  <div>
    <label :for="id" class="mb-1 block text-sm font-medium text-slate-700">{{ label }}</label>
    <select
      :id="id"
      :value="modelValue"
      :aria-invalid="error ? 'true' : undefined"
      :aria-describedby="message ? messageId : undefined"
      :class="[
        'block min-h-11 w-full rounded-xl border bg-white px-3 text-base',
        error ? 'border-red-500' : 'border-slate-300',
      ]"
      @change="$emit('update:modelValue', $event.target.value)"
    >
      <option v-for="option in options" :key="option.value" :value="option.value">
        {{ option.label }}
      </option>
    </select>
    <p
      v-if="message"
      :id="messageId"
      :role="error ? 'alert' : undefined"
      :class="['mt-1 text-sm', error ? 'text-red-600' : 'text-slate-500']"
    >
      {{ message }}
    </p>
  </div>
</template>
