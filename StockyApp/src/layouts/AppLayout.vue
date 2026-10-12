<script setup>
import { useRoute, useRouter } from 'vue-router'
import { ROUTES } from '@/constants/routes'
import BottomTabBar from '@/components/nav/BottomTabBar.vue'

const route = useRoute()
const router = useRouter()

function goBack() {
  if (window.history.state?.back) router.back()
  else router.push({ name: ROUTES.DIARY })
}
</script>

<template>
  <div class="mx-auto flex min-h-dvh w-full max-w-md flex-col bg-slate-50">
    <header
      class="sticky top-0 z-10 flex h-14 items-center gap-2 border-b border-slate-200 bg-white px-2"
    >
      <button
        v-if="route.meta.showBack"
        type="button"
        class="flex h-11 w-11 items-center justify-center rounded-full text-slate-700 hover:bg-slate-100"
        aria-label="Go back"
        @click="goBack"
      >
        <svg viewBox="0 0 24 24" class="h-6 w-6" fill="none" stroke="currentColor" stroke-width="2">
          <path d="M15 19l-7-7 7-7" stroke-linecap="round" stroke-linejoin="round" />
        </svg>
      </button>
      <h1 class="px-2 text-lg font-semibold">{{ route.meta.title }}</h1>
    </header>

    <main :class="['flex-1 px-4 pt-4', route.meta.hideTabBar ? 'pb-8' : 'pb-28']">
      <slot />
    </main>

    <BottomTabBar v-if="!route.meta.hideTabBar" />
  </div>
</template>
