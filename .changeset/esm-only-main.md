---
'@_linked/sentry': patch
---

`main` now points at `lib/esm/index.js`. It named `lib/cjs/index.js`, which the build has never produced — the package is ESM-only — so any resolver that reads `main` instead of `exports` could not find the package at all. The unused `tsconfig-cjs.json` is removed, so `linked build` no longer compiles a CommonJS copy nothing can load.
