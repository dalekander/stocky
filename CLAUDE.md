# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Layout

The git root contains a single Vue 3 + Vite app in `StockyApp/`. Run all commands from that directory. The calorie tracker described in `spec.md` is built: Vue Router, Pinia, Firebase (Auth + Firestore), Tailwind CSS v4, ESLint + Prettier, Vitest + Vue Test Utils (jsdom). Leftover `create-vue` template files (`src/components/HelloWorld.vue`, `TheWelcome.vue`, `WelcomeItem.vue`, `icons/`, `src/assets/base.css`, `logo.svg`) are unused and can be deleted.

Firebase config comes from `StockyApp/.env` (copy `.env.example`); without it the app shows a setup notice. Firestore rules are in `firestore.rules`.

## Commands

Requires Node `^22.18.0 || >=24.12.0`.

```sh
npm install
npm run dev       # Vite dev server with HMR
npm run build     # production build
npm run preview   # serve the production build
npm test          # Vitest, run once (npm run test:watch for watch mode)
npm run lint      # ESLint
npm run format    # Prettier over src/
```

## Architecture

- Entry: `src/main.js` mounts `src/App.vue` onto `#app` in `index.html`.
- Path alias `@` → `src/` (configured in `vite.config.js`, mirrored in `jsconfig.json`).
- Plugins: `@vitejs/plugin-vue` and `vite-plugin-vue-devtools`.
- Plain JavaScript (no TypeScript).

## Product

Mobile-first calorie tracker: users log foods per meal (breakfast/lunch/dinner/snack) per day. Firebase Auth (email/password + Google) and Firestore (`users/{uid}/foods`, `users/{uid}/entries`). New users go through onboarding (`/onboarding`) to compute a daily calorie target (`utils/calorieGoal.js`, profile stored on `users/{uid}`; the router guard enforces it). Full requirements, routes, and data model live in `spec.md`; read it before building features and keep it updated when decisions change.

## Project structure (target, under `StockyApp/src/`)

Dependencies flow one way: **views → components → composables → stores → services → firebase**. A lower layer never imports from a higher one.

- `views/` one thin file per route (`DiaryView.vue`); only composes components
- `layouts/` `AuthLayout.vue`, `AppLayout.vue`
- `components/base/` generic UI with no business logic (`BaseButton`, `BaseInput`, `BaseModal`)
- `components/<feature>/` feature UI (`diary/`, `foods/`, `week/`, `nav/`)
- `composables/` reusable stateful logic, named `useX`
- `stores/` Pinia setup stores
- `services/` the only place that imports `firebase/*`
- `utils/` pure functions (dates, calorie math, validators); `constants/` meals, route names

## Coding standards

### Components
- `<script setup>` with the Composition API only; no Options API. Block order: script, template, `<style scoped>`.
- File names PascalCase and multi-word. Prefix generic components `Base`; views end in `View`, layouts in `Layout`.
- Props down, events up. Never mutate props. Use `v-model` (`modelValue` / `update:modelValue`) for two-way inputs.
- Declare props with `defineProps` (type, required, default) and events with `defineEmits`.
- Prefer slots over piles of boolean props.
- Presentational components (`base/`, row/item components) never import stores or services; data comes via props.
- `v-for` always has a stable `:key` (id, not index); never `v-if` with `v-for` on one element.
- **Reuse rule:** UI that appears in 2+ places, or has its own clear responsibility, becomes a component. Split a file that passes ~200 lines or mixes data fetching with presentation.
- Components never call Firestore directly: composable → store → service.

### JavaScript
- ES modules, `const` by default. Import via the `@` alias, no `../../..` chains.
- JSDoc `@typedef` for shared shapes (`Food`, `Entry`).
- `camelCase` vars/functions, `useX` composables, `UPPER_SNAKE_CASE` constants, `isX`/`hasX` booleans.
- Handle async errors with `try/catch` and show a friendly message; never swallow silently. No leftover `console.log`.

### State and data
- Pinia setup stores (`defineStore('foods', () => { ... })`) call `services/`, not Firebase.
- Clean up Firestore subscriptions on unmount/dispose.
- Dates are `"YYYY-MM-DD"` strings built by one helper in `utils/date.js`, using local timezone.

### Styling and accessibility
- Mobile-first: base styles for phones, `sm:`/`md:` only for larger screens. Tailwind utilities (pending final choice in `spec.md`); repeated utility groups become a component.
- Min tap target 44×44px, visible focus state, labeled inputs, `aria-label` on icon-only buttons.

### Testing
- Specs sit next to the code as `*.spec.js` (config in `vitest.config.js`, shared helpers in `src/test/utils.js`).
- Mock the `@/services/*` modules (never hit real Firebase). Every new util, store, composable and component gets a spec; fix a bug by adding the failing test first.
- Components rendered into `<Teleport>` (modals) are queried on `document.body`; clean it up in `afterEach`.

### Workflow
- Secrets only in `.env` (git-ignored) with a committed `.env.example`.
- Run `npm test`, `npm run lint` and `npm run build` before finishing a change; no lint warnings in merged code (ESLint `flat/recommended` for Vue, Prettier config in `.prettierrc.json`).
- Small focused commits, one feature or fix each.
