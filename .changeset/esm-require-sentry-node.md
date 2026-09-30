---
'@_linked/sentry': patch
---

`SentryBackendErrorLogger` no longer crashes with `ReferenceError: require is not defined` when Sentry is enabled (SENTRY_DSN + SITE_ROOT set, non-development NODE_ENV). The package is ESM; `@sentry/node` is now imported statically, the same module instance `backend.ts` already uses.
