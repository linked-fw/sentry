import assert from 'node:assert/strict';
import test from 'node:test';

/**
 * The package is ESM (`"type": "module"`), so `require` does not exist at
 * runtime. The logger used to load `@sentry/node` with `require(...)` once the
 * environment asked for Sentry — which threw `ReferenceError: require is not
 * defined` for every app with SENTRY_DSN + SITE_ROOT and a non-development
 * NODE_ENV. Development never reaches that line, so it only showed up in
 * production, and aborted the server's boot once providers were loaded eagerly.
 *
 * This loads the BUILT logger from lib/esm, exactly as a consuming app does,
 * and drives the enabled path with a stub Express app.
 */

const ENV_KEYS = ['SENTRY_DSN', 'NODE_ENV', 'SITE_ROOT'];

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

function stubServer() {
  const used = [];
  return { used, use: (...args) => used.push(args) };
}

test('with SENTRY_DSN set, the logger attaches the Sentry error handler instead of throwing', async () => {
  const { SentryBackendErrorLogger } = await import(
    new URL('../lib/esm/utils/SentryBackendErrorLogger.js', import.meta.url)
  );
  const server = stubServer();

  const logger = withEnv(
    {
      SENTRY_DSN: 'https://public@example.invalid/1',
      NODE_ENV: 'production',
      SITE_ROOT: 'https://example.invalid',
    },
    () => new SentryBackendErrorLogger(server),
  );

  assert.ok(
    server.used.length >= 1,
    'Sentry.setupExpressErrorHandler should register its middleware on the app',
  );
  assert.ok(server.used.every(([fn]) => typeof fn === 'function'));
  await logger.log(new Error('captured without a client is a no-op'));
});

test('in development the logger stays inert', async () => {
  const { SentryBackendErrorLogger } = await import(
    new URL('../lib/esm/utils/SentryBackendErrorLogger.js', import.meta.url)
  );
  const server = stubServer();

  const logger = withEnv(
    {
      SENTRY_DSN: 'https://public@example.invalid/1',
      NODE_ENV: 'development',
      SITE_ROOT: 'https://example.invalid',
    },
    () => new SentryBackendErrorLogger(server),
  );

  assert.equal(server.used.length, 0);
  await logger.log(new Error('ignored'));
});
