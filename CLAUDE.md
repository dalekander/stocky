# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Layout

The git root contains a single Vue 3 + Vite app in `StockyApp/`. Run all commands from that directory. It is currently the unmodified `create-vue` scaffold (`HelloWorld`, `TheWelcome`, etc. are template placeholders); there is no router, store, linter, or test runner configured.

## Commands

Requires Node `^22.18.0 || >=24.12.0`.

```sh
npm install
npm run dev       # Vite dev server with HMR
npm run build     # production build
npm run preview   # serve the production build
```

## Architecture

- Entry: `src/main.js` mounts `src/App.vue` onto `#app` in `index.html`.
- Path alias `@` → `src/` (configured in `vite.config.js`, mirrored in `jsconfig.json`).
- Plugins: `@vitejs/plugin-vue` and `vite-plugin-vue-devtools`.
- Plain JavaScript (no TypeScript).
