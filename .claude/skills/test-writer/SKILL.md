---
name: test-writer
description: Write Vitest unit tests for code in StockyApp (utils, constants, stores, composables, components, views). Use when the user asks to write, add, or generate unit tests or a spec for a file, or when a new util/store/composable/component needs its spec.
---

# Test Writer

Writes `*.spec.js` unit tests for the Vue 3 app in `StockyApp/`, following the conventions already used in the existing specs.

## Steps

1. **Identify the target.** Read the source file fully (and its collaborators: the services it calls, the stores it uses). If the user named no file, ask which one, or find files in `StockyApp/src/` that lack a sibling `*.spec.js`.

2. **Read one similar existing spec** to match style before writing:
   - util / constants → `src/utils/date.spec.js`
   - store → `src/stores/foods.spec.js`
   - composable → `src/composables/useDiary.spec.js`
   - base component / modal → `src/components/base/BaseModal.spec.js`
   - feature component → `src/components/foods/FoodForm.spec.js`

3. **Create the spec next to the source** with the same base name: `Foo.vue` → `Foo.spec.js`, `bar.js` → `bar.spec.js`. If a spec already exists, extend it instead of replacing it.

4. **Write tests** using the rules below.

5. **Run and verify** from `StockyApp/` (see the `test-runner` skill):

   ```sh
   cd StockyApp
   npm test -- src/path/to/Foo.spec.js
   npm run lint
   ```

   Fix failures in the spec. If a test reveals a genuine bug in the source, report it to the user instead of bending the test to pass (fix by adding the failing test first, then use `fix-bug`).

## Rules

- Import test APIs explicitly: `import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'`.
- Import code under test via the `@` alias, never relative `../` chains.
- One `describe` per unit (nested `describe` per function/action); `it` names describe behavior, not implementation ("emits close on Escape").
- Cover the happy path, edge cases (empty, zero, boundaries, invalid input) and error paths.
- Keep tests independent; `restoreMocks: true` is already set in `vitest.config.js`, so don't hand-restore spies.
- No real Firebase, no network, no `console.log`. Mock every `@/services/*` module the code touches with `vi.mock(...)` **before** importing the code under test, then import the mocked module to set return values:

  ```js
  vi.mock('@/services/firebase', () => ({ auth: null, db: null, isFirebaseConfigured: true }))
  vi.mock('@/services/foodsService', () => ({ listFoods: vi.fn(), addFood: vi.fn() }))

  import * as foodsService from '@/services/foodsService'
  ```

- Use the shared helpers in `src/test/utils.js`: `freshPinia()` (new Pinia per test), `memoryRouter(names)`, `withSetup(composable, { pinia, router })` (runs a composable inside a real component so lifecycle hooks work; call `unmount()` to test cleanup), `sampleFoods()`.
- Dates are `"YYYY-MM-DD"` local-timezone strings; build them with `utils/date.js` helpers, and use `vi.useFakeTimers()` / `vi.setSystemTime()` for anything depending on "today".

### By layer

- **utils / constants**: pure input → output assertions; table-style cases where useful.
- **stores**: `freshPinia()` in `beforeEach`, set `useAuthStore().user` if the store needs a uid, mock the service, assert state, service call args, loading/error flags, and recovery after failure.
- **composables**: `withSetup(...)`; `await nextTick()` / `flushPromises()` after async changes; assert subscriptions are cleaned up on `unmount()`.
- **components**: `mount` from `@vue/test-utils`; drive via props, slots and DOM events; assert rendered output, `wrapper.emitted(...)` events, and accessibility attributes (`aria-label`, `role`, labels). Presentational components get data via props only. Never assert on Tailwind class names unless they encode state.
- **Teleported components (modals/sheets)**: mount with `attachTo: document.body`, query on `document.body`, and in `afterEach` call `wrapper?.unmount()` and reset `document.body.innerHTML = ''`.
- **views / router**: stub child components or services; use `memoryRouter` and assert guard redirects (e.g. onboarding enforcement).

## Output

After writing, report: the spec file(s) created, the number of tests, the pass/fail result of the run, and any source bugs or untestable areas found.
