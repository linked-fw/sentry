# @_linked/sentry

Shared Sentry setup for Linked applications on the backend (`@sentry/node`)
and frontend (`@sentry/react` with `@sentry/capacitor`).

## Configuration

Sentry requires explicit enablement and all required runtime metadata:

```json
{
  "SENTRY_ENABLED": "true",
  "SENTRY_DSN": "https://example.ingest.sentry.io/123456",
  "NODE_ENV": "production",
  "SITE_ROOT": "https://app.example.com"
}
```

`SENTRY_ENABLED` must be exactly `"true"`. This prevents a configured DSN from
accidentally enabling reporting in local or staging environments.

The shared configuration provides:

- consistent release and environment tags;
- conservative scrubbing of common sensitive fields;
- common network and abort-error filters;
- idempotent backend instrumentation;
- aligned frontend and backend sampling.

## Frontend

Register the frontend logger during application startup:

```ts
import { LinkedErrorLogging } from '@_linked/core/utils/LinkedErrorLogging';
import { SentryFrontendErrorLogger } from '@_linked/sentry/utils/SentryFrontendErrorLogger';

LinkedErrorLogging.setDefaultLogger(new SentryFrontendErrorLogger());
```

## Backend

Loading `@_linked/sentry/backend` registers the package provider. It initializes
instrumentation before controllers, installs the shared error logger, and adds
the Express error handler after controllers.

For the best tracing coverage, initialize instrumentation before Express is
imported:

```ts
import { initSentryInstrumentation } from '@_linked/sentry/utils/instrument';

initSentryInstrumentation();
```

The initializer is safe to call more than once.

Native Node profiling is a separate opt-in because its binary must match the
host Node ABI and libc:

```json
{
  "SENTRY_PROFILING_ENABLED": "true"
}
```

When profiling is disabled, standard backend error reporting and tracing still
work. If an explicitly enabled native profiler cannot load, initialization
logs a warning and continues without profiling.

## Privacy

The `beforeSend` hook recursively redacts values whose keys resemble email,
phone, password, token, authorization, cookie, or DSN fields. Review this list
when introducing new user metadata or custom event payloads.

## Profiling

Backend profiling uses `@sentry/profiling-node` only when
`SENTRY_PROFILING_ENABLED=true`. Keep it disabled on hosts whose Node ABI or
libc is incompatible with the native profiler.
