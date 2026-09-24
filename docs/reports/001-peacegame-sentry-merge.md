---
summary: Opt-in shared Sentry config for Linked apps with scrubbing, lazy Node instrumentation, optional native profiling, and working frontend error capture.
---

# PeaceGame Sentry merge (`@_linked/sentry`)

## Outcome

`@_linked/sentry` on `feature/peacegame-sentry-merge` centralizes frontend and backend Sentry setup behind a single configuration module. Reporting is **opt-in** via `SENTRY_ENABLED=true` (plus DSN / `NODE_ENV` / `SITE_ROOT`), so a copied DSN no longer enables production reporting in local or staging by accident.

The branch merges current `origin/main` with the PeaceGame configuration work.
Wrapup added runtime-boundary fixes, focused tests, consumer documentation, a
minor changeset, and this report; no separate plan doc existed in this package.

## Architecture overview

```
App / linked.config / BackendProvider
        │
        ├─ shouldEnableSentry()          ← sentry-config.ts
        │
        ├─ initSentryInstrumentation()   ← instrument.ts (lazy @sentry/node)
        │       uses getSentryBaseOptions()
        │       optionally loads native profiling
        │
        ├─ SentryBackendErrorLogger      ← captureException when enabled
        │
        └─ SentryFrontendErrorLogger     ← @sentry/capacitor + @sentry/react
                uses getSentryBaseOptions() + replay/tracing integrations
```

### Pipeline

1. **Gate** — `shouldEnableSentry()` requires `SENTRY_ENABLED === "true"`, `SENTRY_DSN`, `NODE_ENV`, and `SITE_ROOT`.
2. **Base options** — `getSentryBaseOptions()` supplies DSN, environment, release string, `ignoreErrors`, and `beforeSend` scrubbing.
3. **Backend** — `initSentryInstrumentation()` synchronously loads and initializes Node once, but only after the environment gate passes. Native profiling is loaded only when separately enabled and safely falls back to normal error reporting when unavailable. `SentryBackendProvider` wires the logger before controllers and the Express error handler after controllers.
4. **Frontend** — `SentryFrontendErrorLogger` constructs Capacitor/React Sentry when enabled and implements `log()` with `captureException` + `flush`.

## Key design decisions

| Decision | Rationale |
|---|---|
| Explicit `SENTRY_ENABLED=true` | Prevents accidental reporting when DSN is present in non-prod env files. Replaces the old “disable only when `NODE_ENV === development`” rule. |
| Shared `sentry-config.ts` | One release/env/scrubbing policy for browser and Node so PeaceGame (and other apps) do not fork init logic. |
| `initSentryInstrumentation()` as a function, not import side effect | Browser entry (`@_linked/sentry` index) must not pull `@sentry/node` / profiling. Callers invoke init from backend or `linked.config`. |
| Idempotent Node init (`Sentry.getClient()`) | PeaceGame may call init from both `linked.config.js` and `backend.ts`; double-init must be a no-op. |
| Lazy Node SDK loading | Importing the package root or running with Sentry disabled must not evaluate backend-only Sentry dependencies. Existing synchronous startup call sites remain compatible. |
| Separate `SENTRY_PROFILING_ENABLED=true` gate | Native profiler compatibility depends on Node ABI and libc. A profiler failure must not disable standard error reporting. |
| Conservative `beforeSend` key scrubbing | Redact values whose keys match email/phone/password/token/authorization/cookie/DSN patterns. |
| Fixed `tracesSampleRate: 0.1` when enabled | Align frontend and backend sampling; enabled environments are expected to be intentional (staging/prod), not “dev with full sample”. |
| Frontend `log()` + `flush(2000)` | Main previously had **no** `IErrorLogger.log` on the frontend class — LinkedErrorLogging could not ship exceptions. |
| Backend logger no longer takes Express `server` | Express error handler belongs on the provider’s `setupAfterControllers`, not inside the logger constructor. |

## File responsibilities

| File | Role |
|---|---|
| `src/utils/sentry-config.ts` | Gate, release/env helpers, scrubbing, shared `getSentryBaseOptions()` |
| `src/utils/instrument.ts` | Lazy, idempotent `@sentry/node` init and optional profiling fallback |
| `src/utils/SentryBackendErrorLogger.ts` | Thin `IErrorLogger` → `captureException` when enabled |
| `src/utils/SentryFrontendErrorLogger.ts` | Capacitor/React init + `log`/`flush` |
| `src/backend.ts` | `BackendProvider` hooks gated by `shouldEnableSentry()` |
| `src/index.ts` | Platform-neutral package root; consumers explicitly import frontend or backend integrations |
| `readme.md` | Consumer docs for env vars, frontend/backend usage, privacy |
| `tsconfig.json` | `skipLibCheck: true` for Sentry/Capacitor type friction |

## Public API surface

Import paths (package exports map `@_linked/sentry/*` → `lib/esm/*`):

- `@_linked/sentry/utils/sentry-config` — `shouldEnableSentry`, `shouldEnableSentryProfiling`, `getSentryBaseOptions`, `getSentryRelease`, `getSentryEnvironment`, `getSentryIgnoreErrors`, `sanitizeSentryEvent`
- `@_linked/sentry/utils/instrument` — `initSentryInstrumentation`, `getSentryNode`
- `@_linked/sentry/utils/SentryFrontendErrorLogger` — `SentryFrontendErrorLogger`
- `@_linked/sentry/utils/SentryBackendErrorLogger` — `SentryBackendErrorLogger`
- `@_linked/sentry/backend` — default `SentryBackendProvider`

### Consumer pattern

```ts
// Early backend / linked.config
import { initSentryInstrumentation } from '@_linked/sentry/utils/instrument';
initSentryInstrumentation();

// Frontend startup
import { LinkedErrorLogging } from '@_linked/core/utils/LinkedErrorLogging';
import { SentryFrontendErrorLogger } from '@_linked/sentry/utils/SentryFrontendErrorLogger';
LinkedErrorLogging.setDefaultLogger(new SentryFrontendErrorLogger());
```

Required env:

```json
{
  "SENTRY_ENABLED": "true",
  "SENTRY_DSN": "https://…",
  "NODE_ENV": "production",
  "SITE_ROOT": "https://app.example.com"
}
```

Optional: `VERSION` or `npm_package_version` / `npm_package_name` for release; `APP_NAME` for tags.

Native backend profiling additionally requires
`SENTRY_PROFILING_ENABLED=true`. Standard error reporting does not.

## Behavioral changes vs `main`

- **Breaking (ops):** DSN + non-development `NODE_ENV` is no longer enough. Apps must set `SENTRY_ENABLED=true`.
- Frontend logger finally implements `log`.
- Node init is no longer a top-level side effect of importing `instrument` from the package index.
- The root package entry is platform-neutral and no longer imports either logger implementation for side effects they do not have.
- Native profiling is separately opt-in and degrades safely when its binary cannot load.
- Shared scrubbing and ignore list (`Network Error`, `Failed to fetch`, `AbortError`).
- Backend provider skips logger + Express handler when disabled.

## Consumer note (PeaceGame)

PeaceGame already wires `shouldEnableSentry`, `initSentryInstrumentation`, and `SENTRY_ENABLED` in `.env-cmdrc.json` / `linked.config.js` / `backend.ts`. That app-side wiring is outside this package’s commits but is the intended merge target for this branch.

## Validation

- Reviewed every file in `origin/main...HEAD` plus the wrapup diff.
- `npm test` passes: the package builds, then Node's built-in test runner executes five focused tests covering enablement, profiling opt-in, release identifiers, recursive scrubbing/non-mutation, and disabled instrumentation.
- `git diff --check` passes.
- A PeaceGame `tsc --noEmit` smoke was attempted directly because PeaceGame is
  being removed from the root workspace. It is currently blocked by three
  unrelated pre-existing `SetYourGoal.tsx` errors where React element props
  resolve to `unknown`; no Sentry type errors were reported.

## Architecture docs

No Create Now architecture doc (`docs/architecture/*`) owns this package’s Sentry wiring. Package `readme.md` is the consumer contract and was rewritten on the branch. No CN architecture update required for this scope.

## Known limitations / follow-ups

1. **`skipLibCheck: true`** masks some Capacitor/Sentry typing issues rather than fixing them upstream.
2. Scrubbing is key-name based only; values under innocuous keys are not redacted.
3. Frontend replay still uses `maskAllText: false` / `blockAllMedia: false` — intentional for product debugging; revisit for stricter privacy.
4. The focused tests do not mock a successful Sentry SDK initialization; integration behavior remains covered by build and application smoke testing.
5. WIP commit messages remain in the published branch history; wrapup does not rewrite shared history.

## PR readiness

| Item | Status |
|---|---|
| Code review / comments | Done in wrapup |
| Dead code related to scope | Removed root logger imports that had no registration side effects |
| Plan → report | No plan doc in package; report written as `docs/reports/001-peacegame-sentry-merge.md` |
| Changeset | Added minor changeset: `.changeset/lazy-sentry-runtime.md` |
| Architecture docs | N/A (readme is contract) |
| Tests | Five focused Node tests pass via `npm test` |
| Build evidence | `npm test` includes and passes `npm run build` |
| PeaceGame smoke | Sentry integration compiles; full check is blocked by unrelated `SetYourGoal.tsx` prop typing errors |

## REVIEW

The wrapup review found and corrected two platform-boundary problems: the
package root still imported a Node-backed logger, and native profiling loaded
before the Sentry enablement gate. The final implementation keeps the root
platform-neutral, lazily loads the Node SDK after opt-in, and makes native
profiling independently optional with a safe fallback.

Readability and dead-code review is complete. Imports whose only purpose was to
load logger classes without side effects were removed. Consumer documentation,
tests, and the minor changeset now match the implemented behavior. The package
is ready for a final commit and PR. A complete application smoke remains a
consumer follow-up after PeaceGame's unrelated `SetYourGoal.tsx` type errors
are resolved.
