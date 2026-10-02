---
summary: >
  The Sentry upgrade is held, not just postponed: `@sentry/capacitor` exact-pins every
  `@sentry/*` sibling, so `@sentry/capacitor`, `@sentry/react`, `@sentry/node` and
  `@sentry/profiling-node` can only move together, in one PR. Covers Renovate PRs sentry#34
  (`@sentry/capacitor` to v4) and sentry#27 (sentry-javascript to 8.55.2, which is unreachable).
  Blocked on the Session Replay decision (Create Now backlog 051); v4 does NOT require
  Capacitor 8.
status: Deferred -- held by the shared Renovate preset; replaces Renovate PRs linked-fw/sentry#34 and #27
---

# 001 — `@sentry/capacitor` and the Sentry JS SDK move together, or not at all

**Status:** deferred. Every `@sentry/*` update in this repo is disabled in
[`linked-fw/renovate-config`](https://github.com/linked-fw/renovate-config) until this is picked
up, because no single-package Sentry PR here can be installed. Renovate PRs
[#34](https://github.com/linked-fw/sentry/pull/34) and
[#27](https://github.com/linked-fw/sentry/pull/27) are superseded by this note. The product
question behind it -- does Create Now keep Session Replay? -- lives in Create Now's
`docs/backlog/051-sentry-capacitor-deep-import.md`.

## How it is used here

All four are runtime `dependencies`, pinned exactly:

| Package | Pin | Used in |
|---|---|---|
| `@sentry/capacitor` | `1.5.0` | `src/utils/SentryFrontendErrorLogger.ts` -- `Sentry.init(..., SentryReact.init)` with `browserTracingIntegration`, **`replayIntegration`** and `replaysSessionSampleRate` / `replaysOnErrorSampleRate` |
| `@sentry/react` | `8.55.0` | same file -- `init` forwarded to capacitor, `captureConsoleIntegration` |
| `@sentry/node` | `8.55.0` | `src/backend.ts`, `src/utils/SentryBackendErrorLogger.ts`, `src/utils/instrument.ts` |
| `@sentry/profiling-node` | `8.55.0` | `src/utils/instrument.ts` -- `nodeProfilingIntegration`, `profilesSampleRate` |

`tsconfig-esm.json` also carries a `skipLibCheck` workaround for capacitor 1.x deep-importing a
non-exported `@sentry/browser` subpath; it can go once capacitor is on 2.x or later.

## Why nothing can move on its own

`@sentry/capacitor` pins its siblings exactly -- `@sentry/core`, `browser`, `types`, `utils` as
dependencies and `@sentry/react`, `vue`, `angular` as peers -- and its `postinstall`
(`scripts/check-siblings.js`) exits 1 on any other `@sentry/*` version. 1.4.0 and 1.5.0 both pin
`8.55.0`, and no later 1.x exists.

- **sentry#27** (sentry-javascript to 8.55.2): capacitor 1.5.0 pins the same exact 8.55.0
  siblings as 1.4.0, so sentry#29 does not unblock #27. Splitting the bump fails on capacitor's
  postinstall check-siblings. Forcing the install with `--ignore-scripts` or
  `--legacy-peer-deps` yields two `@sentry/core` copies on the browser side, which probably
  splits the Sentry client and scope at runtime (`SentryFrontendErrorLogger.ts`).
- **sentry#34** (`@sentry/capacitor` to v4): 4.x peers on `@sentry/react` **10.x** exactly, so
  alone it is an `ERESOLVE` against the pinned `@sentry/react` 8.55.0.

## Is it coupled to Capacitor 8?

**No.** Every `@sentry/capacitor` major from 1 to 4 declares `@capacitor/core >=3.0.0`. 2.0.0
dropped *support* for Capacitor 3-5 (not enforced by the peer range), and Capacitor 8 support was
added during 3.x. So v4 runs on Capacitor 6, 7 or 8. It is held for its own reasons -- the sibling
lock-step and Session Replay -- not because of the Capacitor hold.

## What changes from 1.x

| | JS SDK | Breaking |
|---|---|---|
| **2.0.0** | 9.27 | Capacitor 3/4/5 support dropped; Sentry Android SDK 7 -> 8; Sentry self-hosted 25.2.0+ recommended |
| **3.0.0** | 10.x | JS SDK v10 (OpenTelemetry v2); Vue/Nuxt options move into `siblingOptions`; removed `BaseClient`, `hasTracingEnabled`, `_experiments.enableLogs`; Sentry Cocoa 9 raises iOS minimum to **15.0** (macOS 10.14, tvOS 15) |
| **4.0.0** | 10.60+ | **Session Replay and Profiling removed** |
| **4.4.0** | 10.69 | CocoaPods dropped -- iOS must install via **Swift Package Manager** (remove `pod 'SentryCapacitor'`); Android build fix for AGP 9 |

Sources: [sentry-capacitor CHANGELOG](https://github.com/getsentry/sentry-capacitor/blob/main/CHANGELOG.md)
and the [migration guide](https://docs.sentry.io/platforms/javascript/guides/capacitor/migration/).

`replayIntegration` is used here, so 4.x is a code change, not just a version change: the replay
integration and both `replays*SampleRate` options must go.

## When this is unblocked

1. Settle the Session Replay question (Create Now backlog 051) and pick the capacitor target:
   **3.2.2** keeps Session Replay on JS SDK **10.43.0**; **4.4.0** drops it on **10.69.0**.
2. In **one PR**, set `@sentry/react`, `@sentry/node` and `@sentry/profiling-node` to exactly the
   version that capacitor release pins. If on 4.x, remove `replayIntegration` and the
   `replays*` options from `SentryFrontendErrorLogger.ts`.
3. Check that `npm ls @sentry/core` shows a single version.
4. Drop the `skipLibCheck` workaround in `tsconfig-esm.json` and confirm the build is clean.
5. For native apps: iOS 15 deployment target; on 4.4.0, SPM instead of CocoaPods.
6. Lift the `@sentry/**` hold for this repo in `renovate-config`.
