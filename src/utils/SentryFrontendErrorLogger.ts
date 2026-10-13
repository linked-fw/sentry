import type { IErrorLogger } from '@_linked/core/utils/LinkedErrorLogging';
import * as Sentry from '@sentry/capacitor';
import * as SentryReact from '@sentry/react';
import { getSentryBaseOptions, shouldEnableSentry } from './sentry-config.js';
// captureConsoleIntegration is built into @sentry/react v8+ (was previously
// in the separate @sentry/integrations package, which no longer publishes v8).
const { captureConsoleIntegration } = SentryReact;

export class SentryFrontendErrorLogger implements IErrorLogger {
  private enabled = false;

  constructor() {
    if (!shouldEnableSentry()) {
      return;
    }

    Sentry.init(
      {
        ...getSentryBaseOptions(),
        integrations: [
          Sentry.browserTracingIntegration() as never,
          Sentry.replayIntegration({
            maskAllText: false,
            blockAllMedia: false,
          }) as never,
          captureConsoleIntegration({
            levels: ['error'],
          }) as never,
        ],
        tracesSampleRate: 0.1,
        replaysSessionSampleRate: 0.1,
        replaysOnErrorSampleRate: 1.0,
      },
      SentryReact.init
    );

    this.enabled = true;
  }

  async log(error: any): Promise<void> {
    if (!this.enabled) {
      return;
    }

    Sentry.captureException(error);
    await Sentry.flush(2000);
  }
}
