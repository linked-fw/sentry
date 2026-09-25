import assert from 'node:assert/strict';
import test from 'node:test';

/**
 * Which `linkedPackage()` the decorators come from decides the name everything
 * in this package registers under — the ontology here today, and the IRI of
 * the first `@linkedShape` anyone adds tomorrow (`{baseUri}shape/{slug}/{Name}`).
 * `src/package.ts` used to re-export core's decorators, so all of it landed
 * under `@_linked/core`. Nothing in a type-check or a build can see that; the
 * package tree at runtime is the only witness.
 */

test('the ontology registers under @_linked/sentry, not @_linked/core', async () => {
  await import(
    new URL('../lib/esm/ontologies/sentry.register.js', import.meta.url)
  );
  const modules = globalThis._linked?._modules ?? {};

  assert.ok(
    modules['@_linked/sentry']?.sentry,
    'the sentry ontology is not registered under @_linked/sentry',
  );
  assert.ok(
    !modules['@_linked/core']?.sentry,
    'the sentry ontology leaked into @_linked/core',
  );
});
