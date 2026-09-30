import { IErrorLogger } from '@_linked/core/utils/LinkedErrorLogging';
import * as Sentry from '@sentry/node';

// This package is ESM, so `require` does not exist at runtime. `@sentry/node`
// is a regular dependency and backend.ts already imports it statically, so a
// static import here costs nothing extra and shares the same module instance
// (a `createRequire` would load Sentry's CJS build: a second, separate copy).
let sentryEnabled = false;

export class SentryBackendErrorLogger implements IErrorLogger {
  constructor(server) {
    // check if required environment variables are set
    if (
      !process.env.SENTRY_DSN ||
      !process.env.NODE_ENV ||
      !process.env.SITE_ROOT
    ) {
      console.error(
        'Required environment variables sentry are not set. Sentry is not initialized on SentryBackendProvider.'
      );
      return;
    }

    // disable logging during development
    if (process.env.NODE_ENV === 'development') {
      console.log('Sentry is disabled in development mode.');
      return;
    }

    sentryEnabled = true;
    console.log('Sentry initialized with DSN:', process.env.SENTRY_DSN);
    // RequestHandler creates a separate execution context, so that all
    // transactions/spans/breadcrumbs are isolated across requests
    Sentry.setupExpressErrorHandler(server);
  }

  /**
   * capture and log error to Sentry
   *
   * @param error
   * @returns
   */
  log(error: any): Promise<void> {
    if (sentryEnabled) {
      Sentry.captureException(error);
    }
    return Promise.resolve();
  }
}
