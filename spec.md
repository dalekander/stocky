# Calorie Tracker: Specification

## 1. Overview
Mobile-first web app to log foods eaten per meal per day and see the daily calorie total. Foods are stored per user and reused on later days.

## 2. Tech stack
- Vue 3 + Vite (existing `StockyApp/`), plain JavaScript
- Firebase Auth (email/password + Google), Cloud Firestore
- To add: `firebase`, `vue-router`, `pinia`, a CSS approach (proposed: Tailwind CSS, mobile-first by default), a small chart (built: hand-rolled HTML/CSS bar chart, no chart dependency)
- Dev tooling to add: ESLint (`eslint-plugin-vue`) and Prettier, so the standards in section 7 are enforced automatically
- Config via `.env` (`VITE_FIREBASE_*`), not committed

## 3. User flows
1. **Sign up / Log in**: email+password or Google. Unauthenticated users are redirected to `/login`. After login go to Diary (today).
2. **Diary (home)**: shows selected date, total calories, and four meal sections (Breakfast, Lunch, Dinner, Snacks) with per-meal subtotal and entry list.
3. **Log food**: tap the round "+" button at the right end of the footer (on any main screen) → Log food page with search focused, filtering the user's own saved foods as they type (instant match anywhere in the name from the list reloaded from Firestore on open, plus a debounced prefix query on `nameLower` against `users/{uid}/foods` for anything the list lacks; most recently used first) → pick an item → a sheet asks for the **meal** (Breakfast / Lunch / Dinner / Snacks, defaulted by time of day) and the **number of servings** (serving size shown) → "Log to <meal>". The day logged is the day being viewed in the Diary (today by default). Diary meal sections have no add button.
4. **Create new food**: from Add Food screen "Create new food" → name, calories per serving, serving description (e.g. "1 cup", "100 g") → save → optionally log immediately.
5. **Edit / delete entry**: tap entry → change servings or meal, or delete.
6. **Manage foods**: list of saved foods; edit or delete. Deleting a food does not alter past entries (entries keep a snapshot).
7. **History**: date picker / prev-next arrows on Diary to view and edit any past day.
8. **Weekly chart**: lives in the Settings tab, together with the plan (weight, height, target). Last 7 days of total calories as a bar chart; tap a bar to open that day.
9. **Log out**.

### Onboarding and calorie goal
A user who has no saved profile is redirected to `/onboarding` after login (and from any other signed-in page).
1. **Step 1, about you:** gender, age (18+), height (ft + in), current weight (lb), activity level.
2. **Step 2, weekly goal:** a slider from lose 2 lb/week to gain 2 lb/week in 0.5 lb steps (default lose 1). The daily calorie target updates live as the slider moves.
3. **Save:** stores the profile and target, then opens the Diary. The Diary shows calories left (or over) against the target.
4. **Edit later:** Settings → "Update my plan" reopens the same flow, prefilled.

Formula: Mifflin-St Jeor BMR × activity factor (1.2 / 1.375 / 1.55 / 1.725) = maintenance; target = maintenance + rate × 3500 / 7. Floors of 1,200 kcal (female) and 1,500 kcal (male) apply; if the floor is hit the user is told their real pace. Estimates only, not medical advice.

## 4. Screens and routes
| Route | Screen | Notes |
|---|---|---|
| `/login`, `/signup` | Auth | Email form + "Continue with Google" |
| `/onboarding` | Onboarding | Two steps; also used to edit the plan |
| `/` | Diary | Date header, total vs target, 4 meal sections, bottom nav |
| `/add?date=` | Log food | Search saved foods, create new; footer hidden |
| `/foods` | My Foods | List, edit, delete |
| `/foods/:id` | Edit Food | `/foods/new` creates a food, any other id edits it |
| `/settings` | Settings | Plan (weight, target), weekly chart, account, log out |

Layout: single column. The footer has the tabs Diary and Foods on the left, Settings on the right, and a bold round "+" **Log food** floating button exactly in the centre that rises half above the footer. The footer is hidden on the Log food and Food edit screens. Thumb-reachable primary actions, min tap target 44px, designed at 360–430px width and fluid up to desktop (centered max-width container).

## 5. Project structure
All code lives in `StockyApp/src/`. Layers have one direction of dependency: **views → components → composables → stores → services → firebase**. A lower layer never imports from a higher one.

```
src/
  main.js                  # app bootstrap (pinia, router, auth init)
  App.vue                  # root: <RouterView/> + layout switch
  assets/                  # global styles, images
  router/
    index.js               # routes + auth guard
  views/                   # one file per route (thin, compose components)
    LoginView.vue
    SignupView.vue
    DiaryView.vue
    AddFoodView.vue
    FoodsView.vue
    FoodEditView.vue
    SettingsView.vue
  layouts/
    AuthLayout.vue         # centered card, no tab bar
    AppLayout.vue          # header + page slot + BottomTabBar
  components/
    base/                  # generic, app-agnostic UI (no business logic)
      BaseButton.vue
      BaseInput.vue
      BaseModal.vue
      BaseSpinner.vue
      BaseEmptyState.vue
      BaseConfirmDialog.vue
    diary/                 # diary feature components
      DateSwitcher.vue
      DaySummary.vue
      MealSection.vue
      EntryRow.vue
    foods/                 # food feature components
      FoodSearch.vue
      FoodListItem.vue
      FoodForm.vue         # shared by create + edit
      ServingsInput.vue
    week/
      CalorieBarChart.vue
    nav/
      BottomTabBar.vue
  composables/             # reusable stateful logic (use*)
    useAuth.js
    useDiary.js
    useFoods.js
    useSelectedDate.js
  stores/                  # Pinia setup stores
    auth.js
    foods.js
    entries.js
  services/                # the ONLY place that talks to Firebase
    firebase.js            # init app, auth, db
    authService.js
    foodsService.js
    entriesService.js
  utils/                   # pure functions, no Vue, no Firebase
    date.js                # toDateKey(), addDays(), weekRange()
    calories.js            # totalFor(), sumByMeal()
    validators.js
  constants/
    meals.js               # MEALS = ['breakfast', 'lunch', 'dinner', 'snack']
    routes.js              # route names
```

### Where does code go?
| Question | Answer |
|---|---|
| Is it a page tied to a route? | `views/` |
| Generic UI used anywhere (button, input, modal)? | `components/base/` |
| UI tied to a feature (meal section, food form)? | `components/<feature>/` |
| Stateful logic reused by 2+ components? | `composables/` |
| State shared across screens (user, foods, entries)? | `stores/` |
| Firestore / Auth calls? | `services/` |
| Pure calculation or formatting? | `utils/` |

## 6. Reusable components
Rule: **if a piece of UI appears (or will clearly appear) in 2+ places, or has its own clear responsibility, extract it into a component.** Views stay thin and only compose components.

| Component | Used by | Responsibility |
|---|---|---|
| `BaseButton` | everywhere | Variants (primary, secondary, danger, ghost), loading and disabled states, 44px min tap target |
| `BaseInput` | auth, food form, search, servings | Label, error message, `v-model`, number/text/password types |
| `BaseModal` / `BaseConfirmDialog` | delete food, delete entry | Accessible dialog shell, focus handling |
| `BaseSpinner`, `BaseEmptyState` | every list | Loading and empty states, consistent look |
| `FoodForm` | Add Food (create), Food Edit | Same fields and validation for create and edit; emits `submit` |
| `FoodListItem` | Add Food search results, My Foods | Name, serving label, calories; slot for trailing action |
| `ServingsInput` | log entry, edit entry | Stepper (± 0.5) plus manual number, shows computed calories |
| `EntryRow` | Diary meal sections | One logged entry: name, servings, calories; tap to edit |
| `MealSection` | Diary (×4) | Title, subtotal, entries list |
| `WeekSummary` | Settings | Loads the last 7 days, average, bar chart; emits `select` |
| `DateSwitcher` | Diary | Prev / next / today, emits `update:modelValue` |
| `BottomTabBar` | `AppLayout` | Tab navigation, active state |
| `CalorieBarChart` | Week | Props: `days: [{date, calories}]`; emits `select` |
| `BodyDetailsForm` | Onboarding step 1 | Gender, age, height, weight, activity; validates and emits `submit` |
| `GoalPlanner` | Onboarding step 2 | Slider (`BaseSlider`) + live daily calorie target |
| `BaseSegmented`, `BaseSelect`, `BaseSlider` | forms | Generic segmented control, select, range input |
| `AuthForm` | Login, Signup | Email/password form + Google button, `mode` prop |
| `MealPicker` | Add Food, `EntryEditSheet` | Segmented control for the 4 meals |
| `LogFoodSheet` | Log food | Bottom sheet: meal + servings, confirm to log a food |
| `EntryEditSheet` | Diary | Bottom sheet: change meal / servings, or delete |

## 7. Coding standards (Vue)

### Components
- Use `<script setup>` with the Composition API only. No Options API.
- Single File Component order: `<script setup>`, `<template>`, `<style scoped>`.
- File names are PascalCase and multi-word (`MealSection.vue`, never `Meal.vue`). Base components are prefixed `Base`. Views end in `View`, layouts in `Layout`.
- In templates use PascalCase for components (`<MealSection />`).
- Keep a component focused: if a file passes ~200 lines or mixes data fetching with presentation, split it.
- **Props down, events up.** Never mutate a prop. Use `v-model` (`modelValue` / `update:modelValue`) for two-way inputs.
- Declare props with `defineProps` (with `type`, `required`, `default`) and events with `defineEmits`; name events in kebab-case / verb form (`submit`, `select`, `update:modelValue`).
- Use slots for flexible content (e.g. trailing action in `FoodListItem`) instead of many boolean props.
- Presentational components (`base/`, `diary/EntryRow`, etc.) do not import stores or services. Data comes in via props.
- Use `v-for` with a stable `:key` (the id, never the index). Never put `v-if` and `v-for` on the same element.
- Prefer `computed` for derived values; keep templates free of heavy expressions.
- No inline Firestore calls in components, ever. Go through composable → store → service.

### JavaScript
- ES modules, `const` by default, no `var`.
- Import with the `@` alias (`@/components/base/BaseButton.vue`), no long `../../..` chains.
- Use JSDoc `@typedef` for the shapes `Food` and `Entry` (plain JS project, no TypeScript).
- Names: variables and functions `camelCase`, composables `useX`, constants `UPPER_SNAKE_CASE`, booleans `isX` / `hasX`.
- Small pure functions in `utils/`; no side effects there.
- Always handle async errors (`try/catch`), surface a user-friendly message, never swallow silently.
- No `console.log` left in committed code.

### State and data
- Pinia **setup stores** (`defineStore('foods', () => { ... })`). Stores hold state and actions; they call `services/`, not Firebase directly.
- Services expose small async functions (`listFoods(uid)`, `addEntry(uid, entry)`) and return plain objects. Only `services/` imports from `firebase/*`.
- Subscribe to Firestore with cleanup (`onUnmounted` / store `$dispose`) to avoid leaks.
- Dates are stored as `"YYYY-MM-DD"` strings, built by one helper (`utils/date.js`).

### Styling
- Mobile-first: base styles target phones, add `sm:` / `md:` breakpoints for larger screens only.
- Tailwind utilities in templates; repeated utility groups become a component, not copy-paste. Use `<style scoped>` only for what utilities cannot express.
- Design tokens (colors, spacing) live in the Tailwind config, not hard-coded in components.
- Minimum tap target 44×44px, visible focus state, sufficient color contrast.

### Quality and workflow
- ESLint (`plugin:vue/vue3-recommended`) and Prettier run on commit/CI; no lint warnings in merged code.
- Accessibility: every input has a label, icon-only buttons have `aria-label`, dialogs trap focus.
- Small, focused commits; one feature or fix per commit.
- Secrets only in `.env` (git-ignored); provide `.env.example`.

## 8. Data model (Firestore)
```
users/{uid}                      (profile; absent until onboarding is done)
    gender, age, heightIn, weightLb, activityLevel,
    goalRateLb (signed, lb/week), calorieTarget, onboardedAt, updatedAt
  foods/{foodId}
    name, nameLower, calories (per serving), servingLabel,
    createdAt, updatedAt, lastUsedAt
  entries/{entryId}
    date ("YYYY-MM-DD", user local), meal ("breakfast"|"lunch"|"dinner"|"snack"),
    foodId, foodName (snapshot), servingLabel (snapshot), caloriesPerServing (snapshot), servings,
    totalCalories (= caloriesPerServing × servings), createdAt
```
Queries: entries `where date == X`; weekly `where date >= start and <= end`. Both need only single-field indexes. Food search is a client-side filter over the user's foods (loaded once, cached in store) since lists are small.

## 9. Security rules
Users can read/write only `users/{uid}/**` where `request.auth.uid == uid`. Validate: calories is a non-negative number, meal is in the allowed set, name is a non-empty string of limited length.

## 10. Validation and edge cases
- Calories ≥ 0, servings > 0 (allow decimals, e.g. 0.5)
- Duplicate food names allowed but warn
- Empty states for: no foods yet, empty meal, no data in week
- Loading and error states for every Firestore call; auth errors mapped to friendly messages
- Dates use user's local timezone

## 11. Non-functional
Fast first load on mobile, accessible labels and contrast, no third-party tracking.

## 12. Out of scope (v1)
Metric units, weight tracking over time, macros/micronutrients, public food database or barcode scan, offline/PWA install, meal copy/templates, multi-language.

## 13. Milestones
1. Project setup: dependencies, ESLint/Prettier, folder structure, Firebase project
2. Auth + routing guard + layouts
3. Base components + Foods CRUD
4. Diary + entries
5. History navigation
6. Weekly chart
7. Polish, security rules, deploy (Firebase Hosting)

## 14. Decisions and open questions
Defaults used in the first build (change any of them if you disagree):
- Styling: Tailwind CSS v4
- UI language: English
- Hosting: Firebase Hosting (`firebase.json` included); no emulator set up
- Firebase project: supplied by you via `StockyApp/.env` (see `.env.example`)

Still open: whether to add the Firebase emulator for local development.
