<script setup>
import BaseButton from '@/components/base/BaseButton.vue'
import BaseModal from '@/components/base/BaseModal.vue'

defineProps({
  open: { type: Boolean, required: true },
  title: { type: String, required: true },
  message: { type: String, default: '' },
  confirmLabel: { type: String, default: 'Confirm' },
  isLoading: { type: Boolean, default: false },
  error: { type: String, default: '' },
})

defineEmits(['confirm', 'cancel'])
</script>

<template>
  <BaseModal :open="open" :title="title" @close="$emit('cancel')">
    <p v-if="message" class="text-sm text-slate-600">{{ message }}</p>
    <p v-if="error" role="alert" class="mt-3 text-sm text-red-600">{{ error }}</p>
    <div class="mt-5 flex flex-col gap-2">
      <BaseButton variant="danger" block :loading="isLoading" @click="$emit('confirm')">
        {{ confirmLabel }}
      </BaseButton>
      <BaseButton variant="secondary" block :disabled="isLoading" @click="$emit('cancel')">
        Cancel
      </BaseButton>
    </div>
  </BaseModal>
</template>
