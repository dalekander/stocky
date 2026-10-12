<script setup>
import { nextTick, onBeforeUnmount, ref, useId, watch } from 'vue'

const props = defineProps({
  open: { type: Boolean, required: true },
  title: { type: String, required: true },
})

const emit = defineEmits(['close'])

const titleId = useId()
const panel = ref(null)
let previouslyFocused = null

const FOCUSABLE =
  'button:not([disabled]), [href], input:not([disabled]), select, textarea, [tabindex]:not([tabindex="-1"])'

function onKeydown(event) {
  if (event.key === 'Escape') {
    emit('close')
    return
  }
  if (event.key !== 'Tab' || !panel.value) return

  const items = [...panel.value.querySelectorAll(FOCUSABLE)]
  if (items.length === 0) return
  const first = items[0]
  const last = items[items.length - 1]
  if (event.shiftKey && document.activeElement === first) {
    event.preventDefault()
    last.focus()
  } else if (!event.shiftKey && document.activeElement === last) {
    event.preventDefault()
    first.focus()
  }
}

function lockScroll(locked) {
  document.body.style.overflow = locked ? 'hidden' : ''
}

watch(
  () => props.open,
  async (isOpen) => {
    lockScroll(isOpen)
    if (isOpen) {
      previouslyFocused = document.activeElement
      await nextTick()
      const firstField = panel.value?.querySelector('input, select')
      ;(firstField ?? panel.value)?.focus()
    } else {
      previouslyFocused?.focus?.()
    }
  },
)

onBeforeUnmount(() => lockScroll(false))
</script>

<template>
  <Teleport to="body">
    <div v-if="open" class="fixed inset-0 z-50 flex items-end justify-center sm:items-center">
      <div class="absolute inset-0 bg-slate-900/50" aria-hidden="true" @click="emit('close')" />
      <div
        ref="panel"
        role="dialog"
        aria-modal="true"
        :aria-labelledby="titleId"
        tabindex="-1"
        class="relative max-h-[90dvh] w-full max-w-md overflow-y-auto rounded-t-3xl bg-white p-5 pb-[max(1.25rem,env(safe-area-inset-bottom))] shadow-xl sm:rounded-3xl"
        @keydown="onKeydown"
      >
        <div class="mb-4 flex items-start justify-between gap-3">
          <h2 :id="titleId" class="text-lg font-semibold">{{ title }}</h2>
          <button
            type="button"
            class="-mr-2 -mt-2 flex h-11 w-11 items-center justify-center rounded-full text-slate-500 hover:bg-slate-100"
            aria-label="Close"
            @click="emit('close')"
          >
            <svg
              viewBox="0 0 24 24"
              class="h-5 w-5"
              fill="none"
              stroke="currentColor"
              stroke-width="2"
            >
              <path d="M6 6l12 12M18 6L6 18" stroke-linecap="round" />
            </svg>
          </button>
        </div>
        <slot />
      </div>
    </div>
  </Teleport>
</template>
