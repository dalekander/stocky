<script setup>
import { computed, ref, watch } from 'vue'
import { MEAL_LABELS } from '@/constants/meals'
import { validateServings } from '@/utils/validators'
import BaseButton from '@/components/base/BaseButton.vue'
import BaseModal from '@/components/base/BaseModal.vue'
import MealPicker from '@/components/diary/MealPicker.vue'
import ServingsInput from '@/components/foods/ServingsInput.vue'

const props = defineProps({
  open: { type: Boolean, required: true },
  food: { type: Object, default: null },
  /** Meal that is selected when the sheet opens. */
  defaultMeal: { type: String, default: 'breakfast' },
  /** Shown under the title, e.g. "Today". */
  dateLabel: { type: String, default: '' },
  isSaving: { type: Boolean, default: false },
  error: { type: String, default: '' },
})

const emit = defineEmits(['close', 'confirm'])

const servings = ref(1)
const meal = ref(props.defaultMeal)
const validationError = ref('')

watch(
  () => props.open,
  (isOpen) => {
    if (isOpen) {
      servings.value = 1
      meal.value = props.defaultMeal
      validationError.value = ''
    }
  },
)

const message = computed(() => validationError.value || props.error)

function onConfirm() {
  validationError.value = validateServings(servings.value)
  if (!validationError.value) emit('confirm', { servings: servings.value, meal: meal.value })
}
</script>

<template>
  <BaseModal :open="open" :title="food?.name ?? 'Log food'" @close="emit('close')">
    <div v-if="food" class="space-y-4">
      <p v-if="dateLabel" class="-mt-2 text-sm text-slate-500">Logging for {{ dateLabel }}</p>
      <MealPicker v-model="meal" />
      <ServingsInput
        v-model="servings"
        :calories-per-serving="food.calories"
        :serving-label="food.servingLabel"
      />
      <p v-if="message" role="alert" class="text-sm text-red-600">{{ message }}</p>
      <BaseButton block :loading="isSaving" @click="onConfirm">
        Log to {{ MEAL_LABELS[meal] }}
      </BaseButton>
    </div>
  </BaseModal>
</template>
