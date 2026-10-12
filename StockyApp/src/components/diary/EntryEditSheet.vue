<script setup>
import { computed, ref, watch } from 'vue'
import { validateServings } from '@/utils/validators'
import BaseButton from '@/components/base/BaseButton.vue'
import BaseModal from '@/components/base/BaseModal.vue'
import MealPicker from '@/components/diary/MealPicker.vue'
import ServingsInput from '@/components/foods/ServingsInput.vue'

const props = defineProps({
  open: { type: Boolean, required: true },
  entry: { type: Object, default: null },
  isSaving: { type: Boolean, default: false },
  error: { type: String, default: '' },
})

const emit = defineEmits(['close', 'save', 'delete'])

const servings = ref(1)
const meal = ref('breakfast')
const validationError = ref('')

watch(
  () => [props.open, props.entry],
  ([isOpen, entry]) => {
    if (isOpen && entry) {
      servings.value = entry.servings
      meal.value = entry.meal
      validationError.value = ''
    }
  },
  { immediate: true },
)

const message = computed(() => validationError.value || props.error)

function onSave() {
  validationError.value = validateServings(servings.value)
  if (!validationError.value) emit('save', { meal: meal.value, servings: servings.value })
}
</script>

<template>
  <BaseModal :open="open" :title="entry?.foodName ?? 'Edit entry'" @close="emit('close')">
    <div v-if="entry" class="space-y-4">
      <MealPicker v-model="meal" />
      <ServingsInput
        v-model="servings"
        :calories-per-serving="entry.caloriesPerServing"
        :serving-label="entry.servingLabel || 'serving'"
      />
      <p v-if="message" role="alert" class="text-sm text-red-600">{{ message }}</p>
      <div class="flex flex-col gap-2">
        <BaseButton block :loading="isSaving" @click="onSave">Save changes</BaseButton>
        <BaseButton variant="ghost" block :disabled="isSaving" @click="emit('delete')">
          <span class="text-red-600">Delete entry</span>
        </BaseButton>
      </div>
    </div>
  </BaseModal>
</template>
