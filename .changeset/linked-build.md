---
"@_linked/sentry": patch
---

Build with `linked build`, the standard build for linked packages. The published `lib/` holds the same files as before; the `rimraf` and `copyfiles` dev dependencies are gone. The type packages the compiler config already relies on (`@types/node`, `@types/react`, `@types/react-dom`) are now declared as dev dependencies instead of arriving transitively.
