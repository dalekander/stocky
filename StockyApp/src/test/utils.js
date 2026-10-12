import { createApp, defineComponent, h } from 'vue'
import { createPinia, setActivePinia } from 'pinia'
import { createMemoryHistory, createRouter } from 'vue-router'

/** Fresh active Pinia, so stores never leak state between tests. */
export function freshPinia() {
  const pinia = createPinia()
  setActivePinia(pinia)
  return pinia
}

/** A memory router with the given route names, each rendering an empty div. */
export function memoryRouter(names = ['diary', 'add-food', 'login', 'onboarding']) {
  const routes = names.map((name) => ({
    path: name === 'diary' ? '/' : `/${name}`,
    name,
    component: { render: () => h('div') },
  }))
  return createRouter({ history: createMemoryHistory(), routes })
}

/**
 * Run a composable inside a real component so lifecycle hooks and injections work.
 * @returns {{ result: any, app: import('vue').App, unmount: () => void }}
 */
export function withSetup(composable, { pinia, router } = {}) {
  let result
  const Host = defineComponent({
    setup() {
      result = composable()
      return () => h('div')
    },
  })
  const app = createApp(Host)
  if (pinia) app.use(pinia)
  if (router) app.use(router)
  app.mount(document.createElement('div'))
  return { result, app, unmount: () => app.unmount() }
}

export const sampleFoods = () => [
  {
    id: 'f1',
    name: 'Oatmeal',
    nameLower: 'oatmeal',
    calories: 150,
    servingLabel: '1 cup',
    lastUsedAt: 300,
  },
  {
    id: 'f2',
    name: 'Banana',
    nameLower: 'banana',
    calories: 100,
    servingLabel: '1 medium',
    lastUsedAt: 200,
  },
  {
    id: 'f3',
    name: 'Chicken breast',
    nameLower: 'chicken breast',
    calories: 165,
    servingLabel: '100 g',
    lastUsedAt: 100,
  },
]
