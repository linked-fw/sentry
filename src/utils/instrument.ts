import { createRequire } from 'node:module';
import {
  getSentryBaseOptions,
  shouldEnableSentry,
  shouldEnableSentryProfiling,
} from './sentry-config.js';

type SentryNodeModule = typeof import('@sentry/node');
type ProfilingModule = typeof import('@sentry/profiling-node');

const require = createRequire(import.meta.url);
let sentryNode: SentryNodeModule | undefined;

/** Load the Node SDK only after the environment gate passes. Browser imports
 * and disabled backends therefore never evaluate the Node-only dependency. */
export function getSentryNode(): SentryNodeModule | undefined {
  if (!shouldEnableSentry()) {
    return undefined;
  }
  sentryNode ||= require('@sentry/node') as SentryNodeModule;
  return sentryNode;
}

/**
 * Idempotent Node init. Kept as an explicit function (not an import side
 * effect) so browser bundles that import `@_linked/sentry` do not pull in
 * `@sentry/node` / profiling. Safe to call from linked.config, the backend
 * provider, or an app's own startup path.
 */
export function initSentryInstrumentation() {
  const Sentry = getSentryNode();
  if (!Sentry || Sentry.getClient()) {
    return;
  }

  const integrations: ReturnType<
    ProfilingModule['nodeProfilingIntegration']
  >[] = [];
  if (shouldEnableSentryProfiling()) {
    try {
      const { nodeProfilingIntegration } = require(
        '@sentry/profiling-node'
      ) as ProfilingModule;
      integrations.push(nodeProfilingIntegration());
    } catch (error) {
      // Native profiling must never prevent standard error reporting from
      // starting on a host with an incompatible Node ABI or libc.
      console.warn(
        '[sentry] Native profiling is unavailable; continuing without it:',
        error instanceof Error ? error.message : error
      );
    }
  }

  Sentry.init({
    ...getSentryBaseOptions(),
    integrations,
    tracesSampleRate: 0.1,
    profilesSampleRate: integrations.length ? 1.0 : 0,
  });
}
