import assert from 'node:assert/strict';
import test from 'node:test';

/**
 * The package is ESM (`"type": "module"`), so a bare `require` does not exist
 * at runtime. Loading `@sentry/node` used to throw `ReferenceError: require is
 * not defined` once Sentry was enabled, and that aborted server boot.
 *
 * Express error-handler registration now lives on the backend provider
 * (`getSentryNode()?.setupExpressErrorHandler`). This test loads the built
 * logger the way a consuming app does and checks that constructing it and
 * logging do not throw when the environment asks for Sentry.
 */

const ENV_KEYS = ['SENTRY_ENABLED', 'SENTRY_DSN', 'NODE_ENV', 'SITE_ROOT'];

function withEnv(values, fn) {
  const saved = Object.fromEntries(ENV_KEYS.map((k) => [k, process.env[k]]));
  Object.assign(process.env, values);
  try {
    return fn();
  } finally {
    for (const k of ENV_KEYS) {
      if (saved[k] === undefined) delete process.env[k];
      else process.env[k] = saved[k];
    }
  }
}

test('with Sentry enabled, constructing the logger and logging does not throw', async () => {
  const { SentryBackendErrorLogger } = await import(
    new URL('../lib/esm/utils/SentryBackendErrorLogger.js', import.meta.url)
  );

  const logger = withEnv(
    {
      SENTRY_ENABLED: 'true',
      SENTRY_DSN: 'https://public@example.invalid/1',
      NODE_ENV: 'production',
      SITE_ROOT: 'https://example.invalid',
    },
    () => new SentryBackendErrorLogger(),
  );

  await logger.log(new Error('captured without a client is a no-op'));
  assert.equal(typeof logger.log, 'function');
});

test('without SENTRY_ENABLED the logger stays inert', async () => {
  const { SentryBackendErrorLogger } = await import(
    new URL('../lib/esm/utils/SentryBackendErrorLogger.js', import.meta.url)
  );

  const logger = withEnv(
    {
      SENTRY_ENABLED: 'false',
      SENTRY_DSN: 'https://public@example.invalid/1',
      NODE_ENV: 'production',
      SITE_ROOT: 'https://example.invalid',
    },
    () => new SentryBackendErrorLogger(),
  );

  await logger.log(new Error('ignored'));
  assert.equal(typeof logger.log, 'function');
});
