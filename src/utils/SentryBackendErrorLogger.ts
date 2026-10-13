import type { IErrorLogger } from '@_linked/core/utils/LinkedErrorLogging';
import { shouldEnableSentry } from './sentry-config.js';
import { getSentryNode } from './instrument.js';

export class SentryBackendErrorLogger implements IErrorLogger {
  private enabled = shouldEnableSentry();

  log(error: any): Promise<void> {
    if (this.enabled) {
      getSentryNode()?.captureException(error);
    }
    return Promise.resolve();
  }
}
