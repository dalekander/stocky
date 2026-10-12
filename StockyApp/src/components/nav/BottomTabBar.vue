<script setup>
import { useRouter } from 'vue-router'
import { ROUTES } from '@/constants/routes'
import { useSelectedDate } from '@/composables/useSelectedDate'
import NavTabLink from '@/components/nav/NavTabLink.vue'

const router = useRouter()
const { date, isToday } = useSelectedDate()

const leftTabs = [
  {
    name: ROUTES.DIARY,
    label: 'Diary',
    icon: 'M8 7V3m8 4V3M4 11h16M5 5h14a1 1 0 011 1v14a1 1 0 01-1 1H5a1 1 0 01-1-1V6a1 1 0 011-1z',
  },
  { name: ROUTES.FOODS, label: 'Foods', icon: 'M4 6h16M4 12h16M4 18h10' },
]

const rightTabs = [
  {
    name: ROUTES.SETTINGS,
    label: 'Settings',
    icon: 'M12 12a4 4 0 100-8 4 4 0 000 8zm-8 9a8 8 0 0116 0',
  },
]

/** Open "Log food" for the day being viewed (today unless `?date=` is set). */
function logFood() {
  router.push({ name: ROUTES.ADD_FOOD, query: isToday.value ? {} : { date: date.value } })
}
</script>

<template>
  <nav
    class="fixed inset-x-0 bottom-0 z-10 border-t border-slate-200 bg-white pb-[env(safe-area-inset-bottom)]"
    aria-label="Main"
  >
    <div class="mx-auto flex max-w-md">
      <ul class="flex flex-1">
        <li v-for="tab in leftTabs" :key="tab.name" class="flex-1">
          <NavTabLink :to="{ name: tab.name }" :label="tab.label" :icon="tab.icon" />
        </li>
      </ul>

      <!-- Centre slot: the button floats half above the footer, exactly in the middle. -->
      <div class="relative w-20 shrink-0">
        <button
          type="button"
          class="absolute -top-8 left-1/2 flex h-16 w-16 -translate-x-1/2 items-center justify-center rounded-full bg-brand-600 text-white shadow-xl shadow-brand-700/40 ring-4 ring-white transition-transform hover:bg-brand-700 active:scale-95"
          aria-label="Log food"
          title="Log food"
          @click="logFood"
        >
          <svg
            viewBox="0 0 24 24"
            class="h-8 w-8"
            fill="none"
            stroke="currentColor"
            stroke-width="3.5"
          >
            <path d="M12 4v16M4 12h16" stroke-linecap="round" />
          </svg>
        </button>
      </div>

      <ul class="flex flex-1">
        <li v-for="tab in rightTabs" :key="tab.name" class="flex-1">
          <NavTabLink :to="{ name: tab.name }" :label="tab.label" :icon="tab.icon" />
        </li>
      </ul>
    </div>
  </nav>
</template>
