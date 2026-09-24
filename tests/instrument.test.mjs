import assert from 'node:assert/strict';
import { afterEach, test } from 'node:test';
import {
  getSentryNode,
  initSentryInstrumentation,
} from '../lib/esm/utils/instrument.js';

const originalEnv = { ...process.env };

afterEach(() => {
  process.env = { ...originalEnv };
});

test('disabled instrumentation does not load or initialize the Node SDK', () => {
  delete process.env.SENTRY_ENABLED;
  delete process.env.SENTRY_DSN;

  assert.equal(getSentryNode(), undefined);
  assert.doesNotThrow(() => initSentryInstrumentation());
  assert.equal(getSentryNode(), undefined);
});
