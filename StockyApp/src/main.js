import './assets/main.css'

import { createApp } from 'vue'
import { createPinia } from 'pinia'
import App from './App.vue'
import router from './router'
import { isFirebaseConfigured } from './services/firebase'
import { useAuthStore } from './stores/auth'

const app = createApp(App)
app.use(createPinia())
app.use(router)

const auth = useAuthStore()
if (isFirebaseConfigured) auth.init()
else auth.skipInit()

app.mount('#app')
