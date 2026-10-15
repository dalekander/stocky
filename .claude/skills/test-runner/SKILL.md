---
name: test-runner
description: Run the project's unit tests (Vitest) and report the results. Use when the user asks to run tests, check that tests pass, or verify a change with the test suite.
---

# Test Runner

Runs the Vitest unit test suite for the Vue app in `StockyApp/`.

## Steps

1. Run from the `StockyApp/` directory (not the git root):

   ```sh
   cd StockyApp
   npm test
   ```

   `npm test` runs Vitest once (no watch mode). To run a single spec or filter by name:

   ```sh
   npm test -- src/utils/date.spec.js
   npm test -- -t "test name pattern"
   ```

2. If dependencies are missing (`node_modules` absent), run `npm install` first. Node `^22.18.0 || >=24.12.0` is required.

3. Report the outcome:
   - On success: state the number of test files and tests that passed.
   - On failure: list each failing test with its file, name and the assertion error. Do not hide or summarize away failures.

4. If tests fail, do not modify tests just to make them pass. Diagnose whether the code or the test is wrong, and tell the user which before changing anything.

## Notes

- Specs live next to the code as `*.spec.js`; config is in `StockyApp/vitest.config.js` and shared helpers in `StockyApp/src/test/utils.js`.
- Tests mock `@/services/*`; they never hit real Firebase, so no `.env` is needed.
- Use `npm run test:watch` only if the user explicitly asks for watch mode.
