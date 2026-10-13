import { BackendProvider } from '@_linked/server-utils/utils/BackendProvider';
import { SentryBackendErrorLogger } from './utils/SentryBackendErrorLogger.js';
import { LinkedErrorLogging } from '@_linked/core/utils/LinkedErrorLogging';
import {
  getSentryNode,
  initSentryInstrumentation,
} from './utils/instrument.js';
import { shouldEnableSentry } from './utils/sentry-config.js';

export default class SentryBackendProvider extends BackendProvider {
  setupBeforeControllers() {
    if (shouldEnableSentry()) {
      initSentryInstrumentation();
      LinkedErrorLogging.setDefaultLogger(new SentryBackendErrorLogger());
    }
  }

  setupAfterControllers() {
    if (shouldEnableSentry()) {
      getSentryNode()?.setupExpressErrorHandler(this.server);
    }
  }
}
