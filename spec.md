# Calorie Tracker: Specification

## 1. Overview
Mobile-first web app to log foods eaten per meal per day and see the daily calorie total. Foods are stored per user and reused on later days.

## 2. Tech stack
- Vue 3 + Vite (existing `StockyApp/`), plain JavaScript
- Firebase Auth (email/password + Google), Cloud Firestore
- To add: `firebase`, `vue-router`, `pinia`, a CSS approach (proposed: Tailwind CSS, mobile-first by default), a small chart (proposed: hand-rolled SVG bar chart to avoid a dependency)
- Config via `.env` (`VITE_FIREBASE_*`), not committed

## 3. User flows
1. **Sign up / Log in**: email+password or Google. Unauthenticated users are redirected to `/login`. After login go to Diary (today).
2. **Diary (home)**: shows selected date, total calories, and four meal sections (Breakfast, Lunch, Dinner, Snacks) with per-meal subtotal and entry list.
3. **Add food to a meal**: tap "+" on a meal → Add Food screen with search over the user's saved foods (instant filter, sorted by most recently used) → pick item → enter number of servings → save entry.
4. **Create new food**: from Add Food screen "Create new food" → name, calories per serving, serving description (e.g. "1 cup", "100 g") → save → optionally log immediately.
5. **Edit / delete entry**: tap entry → change servings or meal, or delete.
6. **Manage foods**: list of saved foods; edit or delete. Deleting a food does not alter past entries (entries keep a snapshot).
7. **History**: date picker / prev-next arrows on Diary to view and edit any past day.
8. **Weekly chart**: last 7 days of total calories as a bar chart, tap a bar to open that day.
9. **Log out**.

## 4. Screens and routes
| Route | Screen | Notes |
|---|---|---|
| `/login`, `/signup` | Auth | Email form + "Continue with Google" |
| `/` | Diary | Date header, total, 4 meal sections, bottom nav |
| `/add?meal=&date=` | Add Food | Search saved foods, create new |
| `/foods` | My Foods | List, edit, delete |
| `/foods/:id` | Edit Food | |
| `/week` | Weekly chart | 7-day bars |
| `/settings` | Settings | Account email, log out |

Layout: single column, bottom tab bar (Diary, Week, Foods, Settings), thumb-reachable primary actions, min tap target 44px, designed at 360–430px width and fluid up to desktop (centered max-width container).

## 5. Data model (Firestore)
```
users/{uid}
  foods/{foodId}
    name, nameLower, calories (per serving), servingLabel,
    createdAt, updatedAt, lastUsedAt
  entries/{entryId}
    date ("YYYY-MM-DD", user local), meal ("breakfast"|"lunch"|"dinner"|"snack"),
    foodId, foodName (snapshot), caloriesPerServing (snapshot), servings,
    totalCalories (= caloriesPerServing × servings), createdAt
```
Queries: entries `where date == X`; weekly `where date >= start and <= end`. Both need only single-field indexes. Food search is a client-side filter over the user's foods (loaded once, cached in store) since lists are small.

## 6. Security rules
Users can read/write only `users/{uid}/**` where `request.auth.uid == uid`. Validate: calories is a non-negative number, meal is in the allowed set, name is a non-empty string of limited length.

## 7. Validation and edge cases
- Calories ≥ 0, servings > 0 (allow decimals, e.g. 0.5)
- Duplicate food names allowed but warn
- Empty states for: no foods yet, empty meal, no data in week
- Loading and error states for every Firestore call; auth errors mapped to friendly messages
- Dates use user's local timezone

## 8. Non-functional
Fast first load on mobile, accessible labels and contrast, no third-party tracking.

## 9. Out of scope (v1)
Daily calorie goal, macros/micronutrients, public food database or barcode scan, offline/PWA install, meal copy/templates, multi-language.

## 10. Milestones
1. Firebase project + Auth + routing guard
2. Foods CRUD
3. Diary + entries
4. History navigation
5. Weekly chart
6. Polish, security rules, deploy (Firebase Hosting)

## 11. Open questions
- Tailwind CSS vs Bootstrap for styling? (proposed: Tailwind)
- Use the Firebase emulator for local development?
- Hosting target: Firebase Hosting?
- UI language: English or Indonesian?
- Do you already have a Firebase project?
