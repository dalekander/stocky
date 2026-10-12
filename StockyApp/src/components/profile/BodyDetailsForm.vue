<script setup>
import { ref } from 'vue'
import { ACTIVITY_LEVELS, GENDERS } from '@/constants/profile'
import { validateProfile } from '@/utils/validators'
import BaseButton from '@/components/base/BaseButton.vue'
import BaseInput from '@/components/base/BaseInput.vue'
import BaseSegmented from '@/components/base/BaseSegmented.vue'
import BaseSelect from '@/components/base/BaseSelect.vue'

const props = defineProps({
  /** @type {import('vue').PropType<Partial<import('@/utils/calorieGoal').BodyDetails>|null>} */
  initial: { type: Object, default: null },
  submitLabel: { type: String, default: 'Continue' },
})

const emit = defineEmits(['submit'])

const activityOptions = ACTIVITY_LEVELS.map((item) => ({
  value: item.value,
  label: `${item.label} – ${item.hint}`,
}))

const start = props.initial ?? {}
const gender = ref(start.gender ?? '')
const age = ref(start.age ?? '')
const feet = ref(start.heightIn ? Math.floor(start.heightIn / 12) : '')
const inches = ref(start.heightIn ? start.heightIn % 12 : '')
const weightLb = ref(start.weightLb ?? '')
const activityLevel = ref(start.activityLevel ?? 'light')
const errors = ref({})

function onSubmit() {
  const result = validateProfile({
    gender: gender.value,
    age: age.value,
    feet: feet.value,
    inches: inches.value,
    weightLb: weightLb.value,
    activityLevel: activityLevel.value,
  })
  errors.value = result.errors
  if (result.ok) emit('submit', result.values)
}
</script>

<template>
  <form class="space-y-4" novalidate @submit.prevent="onSubmit">
    <div>
      <p id="gender-label" class="mb-1 text-sm font-medium text-slate-700">Gender</p>
      <BaseSegmented v-model="gender" :options="GENDERS" label="Gender" />
      <p v-if="errors.gender" role="alert" class="mt-1 text-sm text-red-600">{{ errors.gender }}</p>
      <p class="mt-1 text-xs text-slate-500">Used only for the calorie formula.</p>
    </div>

    <BaseInput
      v-model="age"
      label="Age"
      type="number"
      inputmode="numeric"
      min="18"
      placeholder="e.g. 30"
      :error="errors.age"
    />

    <fieldset>
      <legend class="mb-1 text-sm font-medium text-slate-700">Height</legend>
      <div class="grid grid-cols-2 gap-3">
        <BaseInput
          v-model="feet"
          label="Feet"
          type="number"
          inputmode="numeric"
          min="4"
          max="8"
          placeholder="5"
        />
        <BaseInput
          v-model="inches"
          label="Inches"
          type="number"
          inputmode="decimal"
          min="0"
          max="11"
          placeholder="8"
        />
      </div>
      <p v-if="errors.height" role="alert" class="mt-1 text-sm text-red-600">{{ errors.height }}</p>
    </fieldset>

    <BaseInput
      v-model="weightLb"
      label="Current weight (lb)"
      type="number"
      inputmode="decimal"
      min="66"
      step="any"
      placeholder="e.g. 165"
      :error="errors.weightLb"
    />

    <BaseSelect
      v-model="activityLevel"
      label="Activity level"
      :options="activityOptions"
      :error="errors.activityLevel"
    />

    <BaseButton type="submit" block>{{ submitLabel }}</BaseButton>
  </form>
</template>
