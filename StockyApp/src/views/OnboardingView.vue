<script setup>
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import { GOAL_RATE } from '@/constants/profile'
import { ROUTES } from '@/constants/routes'
import { useProfile } from '@/composables/useProfile'
import BaseButton from '@/components/base/BaseButton.vue'
import BodyDetailsForm from '@/components/profile/BodyDetailsForm.vue'
import GoalPlanner from '@/components/profile/GoalPlanner.vue'

const router = useRouter()
const { profile, isOnboarded, save } = useProfile()

const step = ref(1)
const details = ref(null)
const goalRate = ref(profile.value?.goalRateLb ?? GOAL_RATE.default)
const isSaving = ref(false)
const error = ref('')

function onDetails(values) {
  details.value = values
  step.value = 2
}

async function onSave() {
  isSaving.value = true
  error.value = ''
  try {
    await save({ ...details.value, goalRateLb: goalRate.value })
    await router.replace({ name: ROUTES.DIARY })
  } catch (caught) {
    error.value =
      caught?.code === 'permission-denied'
        ? 'Firestore rejected saving your plan. Deploy the latest firestore.rules for this project and try again.'
        : 'Could not save your plan. Please try again.'
  } finally {
    isSaving.value = false
  }
}
</script>

<template>
  <div class="space-y-4">
    <header>
      <p class="text-sm font-medium text-brand-700">Step {{ step }} of 2</p>
      <h2 class="text-xl font-semibold">
        {{ step === 1 ? 'Tell us about you' : 'Set your weekly goal' }}
      </h2>
      <p v-if="step === 1" class="text-sm text-slate-600">
        We use this to estimate how many calories you need each day.
      </p>
    </header>

    <div v-if="step === 1" class="rounded-2xl bg-white p-4 shadow-sm">
      <BodyDetailsForm :initial="profile" @submit="onDetails" />
    </div>

    <template v-else>
      <GoalPlanner v-model="goalRate" :details="details" />

      <p v-if="error" role="alert" class="text-sm text-red-600">{{ error }}</p>

      <div class="flex flex-col gap-2">
        <BaseButton block :loading="isSaving" @click="onSave">Save my plan</BaseButton>
        <BaseButton variant="secondary" block :disabled="isSaving" @click="step = 1"
          >Back</BaseButton
        >
      </div>
    </template>

    <BaseButton
      v-if="isOnboarded"
      variant="ghost"
      block
      @click="router.replace({ name: ROUTES.SETTINGS })"
    >
      Cancel
    </BaseButton>
  </div>
</template>
