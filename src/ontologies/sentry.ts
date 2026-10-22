import { Prefix } from '@_linked/core/utils/Prefix';
import { createNameSpace } from '@_linked/core/utils/NameSpace';
import { loadOntologyFiles } from '@_linked/core/ontology/loadOntologyFiles';

/** The package's ontology data, relative to this module (Turtle, copied into `lib/` by the build). */
export const dataFiles = ['../data/sentry.ttl'];

/** Reads the package's ontology data (server only). */
export const loadData = () => loadOntologyFiles(import.meta.url, dataFiles);

/**
 * First-party ontologies live on linked.cm: `https://linked.cm/ont/{ontologySlug}/`, and a
 * package's own ontology takes the package's publicSlug (`@_linked/sentry` → `sentry`).
 * Until this release it was `http://lincd.org/ont/sentry/`; none of its terms types stored data.
 */
const base = 'https://linked.cm/ont/sentry/';

Prefix.add('sentry', base);

export const ns = createNameSpace(base);

export const _self = ns('');
export const ExampleClass = ns('ExampleClass');
export const exampleProperty = ns('exampleProperty');

export const sentry = {
  _self,
  ExampleClass,
  exampleProperty,
};

