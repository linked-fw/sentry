import './types.js';
import './ontologies/sentry.js';

// Keep the package root platform-neutral. Applications explicitly import the
// frontend logger or backend provider they use; neither has registration side
// effects that belong in this shared entrypoint.
