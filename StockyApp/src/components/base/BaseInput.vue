<script setup>
import { computed, useId } from 'vue'

defineOptions({ inheritAttrs: false })

const props = defineProps({
  modelValue: { type: [String, Number], default: '' },
  label: { type: String, required: true },
  type: { type: String, default: 'text' },
  error: { type: String, default: '' },
  hint: { type: String, default: '' },
})

defineEmits(['update:modelValue'])

const id = useId()
const messageId = computed(() => `${id}-message`)
const hasMessage = computed(() => Boolean(props.error || props.hint))
</script>

<template>
  <div>
    <label :for="id" class="mb-1 block text-sm font-medium text-slate-700">{{ label }}</label>
    <input
      v-bind="$attrs"
      :id="id"
      :type="type"
      :value="modelValue"
      :aria-invalid="error ? 'true' : undefined"
      :aria-describedby="hasMessage ? messageId : undefined"
      :class="[
        'block min-h-11 w-full rounded-xl border bg-white px-3 text-base placeholder:text-slate-400',
        error ? 'border-red-500' : 'border-slate-300',
      ]"
      @input="$emit('update:modelValue', $event.target.value)"
    />
    <p
      v-if="hasMessage"
      :id="messageId"
      :role="error ? 'alert' : undefined"
      :class="['mt-1 text-sm', error ? 'text-red-600' : 'text-amber-700']"
    >
      {{ error || hint }}
    </p>
  </div>
</template>
