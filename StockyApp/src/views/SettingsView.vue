<script setup>
import { useRouter } from 'vue-router'
import { ROUTES } from '@/constants/routes'
import { describeRate } from '@/utils/calorieGoal'
import { formatCalories } from '@/utils/calories'
import { useAuth } from '@/composables/useAuth'
import { useProfile } from '@/composables/useProfile'
import BaseButton from '@/components/base/BaseButton.vue'
import WeekSummary from '@/components/week/WeekSummary.vue'

const router = useRouter()
const { user, isLoading, error, logout } = useAuth()
const { profile, calorieTarget } = useProfile()

const openDay = (date) => router.push({ name: ROUTES.DIARY, query: { date } })
</script>

<template>
  <div class="space-y-4">
    <section v-if="profile" class="rounded-2xl bg-white p-4 shadow-sm">
      <h2 class="text-sm font-medium text-slate-600">Your plan</h2>
      <p class="mt-1 text-base font-semibold">
        {{ formatCalories(calorieTarget) }} kcal / day · {{ describeRate(profile.goalRateLb) }}
      </p>
      <p class="mt-1 text-sm text-slate-600">
        {{ profile.weightLb }} lb · {{ Math.floor(profile.heightIn / 12) }} ft
        {{ profile.heightIn % 12 }} in · {{ profile.age }} yrs
      </p>
      <BaseButton
        variant="secondary"
        block
        class="mt-3"
        @click="router.push({ name: ROUTES.ONBOARDING })"
      >
        Update my plan
      </BaseButton>
    </section>

    <WeekSummary @select="openDay" />

    <section class="rounded-2xl bg-white p-4 shadow-sm">
      <h2 class="text-sm font-medium text-slate-600">Signed in as</h2>
      <p class="mt-1 break-all text-base font-semibold">{{ user?.email ?? user?.displayName }}</p>
    </section>

    <p v-if="error" role="alert" class="text-sm text-red-600">{{ error }}</p>

    <BaseButton variant="secondary" block :loading="isLoading" @click="logout">Log out</BaseButton>
  </div>
</template>
