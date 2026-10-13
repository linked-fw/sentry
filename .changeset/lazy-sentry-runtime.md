---
"@_linked/sentry": minor
---

Add shared opt-in Sentry configuration, recursive sensitive-field scrubbing,
working frontend error capture, and idempotent backend initialization. Native
Node profiling is now separately enabled with `SENTRY_PROFILING_ENABLED=true`;
an unavailable profiler no longer prevents standard error reporting from
starting.
