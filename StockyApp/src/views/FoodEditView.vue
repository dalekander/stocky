<script setup>
import { computed, onMounted, ref } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { ROUTES } from '@/constants/routes'
import { useFoods } from '@/composables/useFoods'
import BaseButton from '@/components/base/BaseButton.vue'
import BaseConfirmDialog from '@/components/base/BaseConfirmDialog.vue'
import BaseEmptyState from '@/components/base/BaseEmptyState.vue'
import BaseSpinner from '@/components/base/BaseSpinner.vue'
import FoodForm from '@/components/foods/FoodForm.vue'

const route = useRoute()
const router = useRouter()
const { foods, isLoading, error, load, getById, createFood, updateFood, deleteFood } = useFoods()

const id = computed(() => String(route.params.id))
const isNew = computed(() => id.value === 'new')
const food = computed(() => (isNew.value ? null : getById(id.value)))

const isSaving = ref(false)
const isConfirmingDelete = ref(false)
const actionError = ref('')

const existingNames = computed(() =>
  foods.value.filter((item) => item.id !== id.value).map((item) => item.name),
)

onMounted(() => load())

const backToList = () => router.replace({ name: ROUTES.FOODS })

async function run(action, failureMessage) {
  isSaving.value = true
  actionError.value = ''
  try {
    await action()
    await backToList()
  } catch {
    actionError.value = failureMessage
  } finally {
    isSaving.value = false
  }
}

const onSubmit = (values) =>
  run(
    () => (isNew.value ? createFood(values) : updateFood(id.value, values)),
    'Could not save this food. Please try again.',
  )

const onDelete = () =>
  run(() => deleteFood(id.value), 'Could not delete this food. Please try again.')
</script>

<template>
  <div>
    <div v-if="isLoading" class="flex justify-center py-6 text-brand-600"><BaseSpinner /></div>

    <p v-else-if="error" role="alert" class="rounded-2xl bg-red-50 p-4 text-sm text-red-700">
      {{ error }}
    </p>

    <BaseEmptyState
      v-else-if="!isNew && !food"
      title="Food not found"
      description="It may have been deleted."
    >
      <BaseButton variant="secondary" @click="backToList">Back to my foods</BaseButton>
    </BaseEmptyState>

    <template v-else>
      <section class="rounded-2xl bg-white p-4 shadow-sm">
        <FoodForm
          :key="id"
          :initial="food ?? undefined"
          :existing-names="existingNames"
          :submit-label="isNew ? 'Create food' : 'Save changes'"
          :is-saving="isSaving"
          :error="actionError"
          @submit="onSubmit"
        />
      </section>

      <BaseButton
        v-if="!isNew"
        variant="ghost"
        block
        class="mt-3"
        @click="isConfirmingDelete = true"
      >
        <span class="text-red-600">Delete food</span>
      </BaseButton>
      <p v-if="!isNew" class="mt-2 text-center text-xs text-slate-500">
        Past diary entries keep their original name and calories.
      </p>
    </template>

    <BaseConfirmDialog
      :open="isConfirmingDelete"
      title="Delete this food?"
      :message="food ? `${food.name} will be removed from your saved foods.` : ''"
      confirm-label="Delete"
      :is-loading="isSaving"
      :error="actionError"
      @confirm="onDelete"
      @cancel="isConfirmingDelete = false"
    />
  </div>
</template>
