<script setup>
import { computed, ref } from 'vue'
import { ROUTES } from '@/constants/routes'
import { useAuth } from '@/composables/useAuth'
import BaseButton from '@/components/base/BaseButton.vue'
import BaseInput from '@/components/base/BaseInput.vue'

const props = defineProps({
  mode: {
    type: String,
    required: true,
    validator: (value) => ['login', 'signup'].includes(value),
  },
})

const { isLoading, error, signIn, signUp, signInWithGoogle } = useAuth()

const email = ref('')
const password = ref('')

const isSignup = computed(() => props.mode === 'signup')

function onSubmit() {
  return isSignup.value ? signUp(email.value, password.value) : signIn(email.value, password.value)
}
</script>

<template>
  <div class="rounded-2xl bg-white p-5 shadow-sm">
    <h2 class="text-xl font-semibold">{{ isSignup ? 'Create your account' : 'Welcome back' }}</h2>

    <form class="mt-4 space-y-4" novalidate @submit.prevent="onSubmit">
      <BaseInput
        v-model="email"
        label="Email"
        type="email"
        autocomplete="email"
        inputmode="email"
        required
      />
      <BaseInput
        v-model="password"
        label="Password"
        type="password"
        :autocomplete="isSignup ? 'new-password' : 'current-password'"
        :hint="isSignup ? 'At least 6 characters.' : ''"
        required
      />

      <p v-if="error" role="alert" class="text-sm text-red-600">{{ error }}</p>

      <BaseButton type="submit" block :loading="isLoading">
        {{ isSignup ? 'Sign up' : 'Log in' }}
      </BaseButton>
    </form>

    <div class="my-4 flex items-center gap-3 text-xs text-slate-500">
      <span class="h-px flex-1 bg-slate-200" />
      or
      <span class="h-px flex-1 bg-slate-200" />
    </div>

    <BaseButton variant="secondary" block :disabled="isLoading" @click="signInWithGoogle">
      Continue with Google
    </BaseButton>

    <p class="mt-5 text-center text-sm text-slate-600">
      <template v-if="isSignup">
        Already have an account?
        <RouterLink :to="{ name: ROUTES.LOGIN }" class="font-medium text-brand-700"
          >Log in</RouterLink
        >
      </template>
      <template v-else>
        New here?
        <RouterLink :to="{ name: ROUTES.SIGNUP }" class="font-medium text-brand-700">
          Create an account
        </RouterLink>
      </template>
    </p>
  </div>
</template>
