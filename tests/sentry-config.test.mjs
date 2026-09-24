import assert from 'node:assert/strict';
import { afterEach, describe, test } from 'node:test';
import {
  getSentryRelease,
  sanitizeSentryEvent,
  shouldEnableSentry,
  shouldEnableSentryProfiling,
} from '../lib/esm/utils/sentry-config.js';

const originalEnv = { ...process.env };

afterEach(() => {
  process.env = { ...originalEnv };
});

const enableSentry = () => {
  process.env.SENTRY_ENABLED = 'true';
  process.env.SENTRY_DSN = 'https://public@example.invalid/1';
  process.env.NODE_ENV = 'production';
  process.env.SITE_ROOT = 'https://app.example.invalid';
};

describe('Sentry configuration', () => {
  test('requires explicit enablement and runtime metadata', () => {
    enableSentry();
    assert.equal(shouldEnableSentry(), true);

    delete process.env.SENTRY_ENABLED;
    assert.equal(shouldEnableSentry(), false);
  });

  test('requires a separate profiling opt-in', () => {
    enableSentry();
    assert.equal(shouldEnableSentryProfiling(), false);

    process.env.SENTRY_PROFILING_ENABLED = 'true';
    assert.equal(shouldEnableSentryProfiling(), true);
  });

  test('constructs a stable release identifier', () => {
    process.env.npm_package_name = 'peacegame';
    process.env.npm_package_version = '4.2.6';
    assert.equal(getSentryRelease(), 'peacegame@4.2.6');

    process.env.VERSION = 'release-42';
    assert.equal(getSentryRelease(), 'peacegame@release-42');
  });

  test('redacts nested sensitive keys without mutating the input', () => {
    process.env.APP_NAME = 'PeaceGame';
    process.env.NODE_ENV = 'staging';
    process.env.SITE_ROOT = 'https://peacegame.example.invalid';
    const event = {
      user: { email: 'person@example.invalid', id: 'user-1' },
      request: {
        headers: { authorization: 'Bearer secret', accept: 'application/json' },
      },
      breadcrumbs: [{ data: { phone: '+31000000000', action: 'signin' } }],
    };

    const sanitized = sanitizeSentryEvent(event);

    assert.equal(sanitized.user.email, '[REDACTED]');
    assert.equal(sanitized.user.id, 'user-1');
    assert.equal(sanitized.request.headers.authorization, '[REDACTED]');
    assert.equal(sanitized.request.headers.accept, 'application/json');
    assert.equal(sanitized.breadcrumbs[0].data.phone, '[REDACTED]');
    assert.equal(sanitized.breadcrumbs[0].data.action, 'signin');
    assert.equal(sanitized.tags.app, 'PeaceGame');
    assert.equal(event.user.email, 'person@example.invalid');
  });
});
