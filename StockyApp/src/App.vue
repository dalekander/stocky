<script setup>
import { computed } from 'vue'
import { useRoute } from 'vue-router'
import { isFirebaseConfigured } from '@/services/firebase'
import AppLayout from '@/layouts/AppLayout.vue'
import AuthLayout from '@/layouts/AuthLayout.vue'
import FirebaseSetupNotice from '@/components/auth/FirebaseSetupNotice.vue'

const route = useRoute()
const layouts = { auth: AuthLayout, app: AppLayout }
const layout = computed(() => layouts[route.meta.layout] ?? AppLayout)
</script>

<template>
  <FirebaseSetupNotice v-if="!isFirebaseConfigured" />
  <component :is="layout" v-else>
    <RouterView />
  </component>
</template>
