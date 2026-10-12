<script setup>
import { computed, ref } from 'vue'
import { DEFAULT_SERVING_LABEL, validateFood } from '@/utils/validators'
import BaseButton from '@/components/base/BaseButton.vue'
import BaseInput from '@/components/base/BaseInput.vue'

const props = defineProps({
  initial: {
    type: Object,
    default: () => ({ name: '', calories: '', servingLabel: '' }),
  },
  /** Names of the user's other foods, used to warn about duplicates. */
  existingNames: { type: Array, default: () => [] },
  submitLabel: { type: String, default: 'Save food' },
  isSaving: { type: Boolean, default: false },
  error: { type: String, default: '' },
})

const emit = defineEmits(['submit'])

const name = ref(props.initial.name)
const calories = ref(props.initial.calories)
const servingLabel = ref(props.initial.servingLabel)
const errors = ref({})

const duplicateHint = computed(() => {
  const typed = name.value.trim().toLowerCase()
  const isDuplicate =
    typed && props.existingNames.some((item) => item.trim().toLowerCase() === typed)
  return isDuplicate ? 'You already have a food with this name. You can still save it.' : ''
})

function onSubmit() {
  const result = validateFood({
    name: name.value,
    calories: calories.value,
    servingLabel: servingLabel.value,
  })
  errors.value = result.errors
  if (result.ok) emit('submit', result.values)
}
</script>

<template>
  <form class="space-y-4" novalidate @submit.prevent="onSubmit">
    <BaseInput
      v-model="name"
      label="Name"
      placeholder="e.g. Oatmeal"
      autocomplete="off"
      :error="errors.name"
      :hint="duplicateHint"
    />
    <BaseInput
      v-model="calories"
      label="Calories per serving"
      type="number"
      inputmode="decimal"
      min="0"
      step="any"
      placeholder="e.g. 150"
      :error="errors.calories"
    />
    <BaseInput
      v-model="servingLabel"
      label="Serving size"
      :placeholder="DEFAULT_SERVING_LABEL"
      autocomplete="off"
      :error="errors.servingLabel"
    />

    <p v-if="error" role="alert" class="text-sm text-red-600">{{ error }}</p>

    <BaseButton type="submit" block :loading="isSaving">{{ submitLabel }}</BaseButton>
  </form>
</template>
