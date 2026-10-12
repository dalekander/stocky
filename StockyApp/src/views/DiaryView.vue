<script setup>
import { ref } from 'vue'
import { useDiary } from '@/composables/useDiary'
import BaseButton from '@/components/base/BaseButton.vue'
import BaseConfirmDialog from '@/components/base/BaseConfirmDialog.vue'
import BaseSpinner from '@/components/base/BaseSpinner.vue'
import DateSwitcher from '@/components/diary/DateSwitcher.vue'
import DaySummary from '@/components/diary/DaySummary.vue'
import EntryEditSheet from '@/components/diary/EntryEditSheet.vue'
import MealSection from '@/components/diary/MealSection.vue'

const {
  date,
  meals,
  dayTotal,
  goal,
  entryCount,
  isLoading,
  error,
  reload,
  updateEntry,
  removeEntry,
} = useDiary()

const editing = ref(null)
const isConfirmingDelete = ref(false)
const isSaving = ref(false)
const actionError = ref('')

function openEdit(entry) {
  actionError.value = ''
  editing.value = entry
}

function closeEdit() {
  editing.value = null
  isConfirmingDelete.value = false
}

async function runAction(action, failureMessage) {
  isSaving.value = true
  actionError.value = ''
  try {
    await action()
    closeEdit()
  } catch {
    actionError.value = failureMessage
  } finally {
    isSaving.value = false
  }
}

const onSave = (changes) =>
  runAction(
    () => updateEntry(editing.value.id, changes),
    'Could not save your changes. Please try again.',
  )

const onDelete = () =>
  runAction(() => removeEntry(editing.value.id), 'Could not delete this entry. Please try again.')
</script>

<template>
  <div class="space-y-4">
    <DateSwitcher v-model="date" />
    <DaySummary :total="dayTotal" :entry-count="entryCount" :goal="goal" />

    <div v-if="error" role="alert" class="rounded-2xl bg-red-50 p-4 text-sm text-red-700">
      <p>{{ error }}</p>
      <BaseButton variant="secondary" class="mt-3" @click="reload">Try again</BaseButton>
    </div>

    <div v-if="isLoading && entryCount === 0" class="flex justify-center py-6 text-brand-600">
      <BaseSpinner />
    </div>

    <template v-else>
      <MealSection
        v-for="item in meals"
        :key="item.meal"
        :meal="item.meal"
        :entries="item.entries"
        :total="item.total"
        @select="openEdit"
      />
    </template>

    <EntryEditSheet
      :open="Boolean(editing) && !isConfirmingDelete"
      :entry="editing"
      :is-saving="isSaving"
      :error="actionError"
      @close="closeEdit"
      @save="onSave"
      @delete="isConfirmingDelete = true"
    />

    <BaseConfirmDialog
      :open="isConfirmingDelete"
      title="Delete this entry?"
      :message="editing ? `${editing.foodName} will be removed from your diary.` : ''"
      confirm-label="Delete"
      :is-loading="isSaving"
      :error="actionError"
      @confirm="onDelete"
      @cancel="isConfirmingDelete = false"
    />
  </div>
</template>
