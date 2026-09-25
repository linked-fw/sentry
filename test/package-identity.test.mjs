import assert from 'node:assert/strict';
import test from 'node:test';

/**
 * Which `linkedPackage()` the decorators come from decides the name everything
 * in this package registers under — the ontology here today, and the IRI of the
 * first `@linkedShape` anyone adds tomorrow. `src/package.ts` used to re-export
 * core's decorators, so all of it landed under `@_linked/core`.
 *
 * The test is on object identity rather than on a registered IRI or a key in
 * the global package tree, because both of those are core's own shapes and have
 * changed across its versions — and CI resolves a different `@_linked/core`
 * from the workspace does. `packageExports` *being* core's registry object is
 * the defect itself, stated in the one form that holds on every version.
 */

test('this package does not share core\'s export registry', async () => {
  const own = await import(new URL('../lib/esm/package.js', import.meta.url));
  const core = await import('@_linked/core/package');

  assert.notEqual(
    own.packageExports,
    core.packageExports,
    'packageExports is core\'s registry: the decorators here are core\'s, so ' +
      'everything declared in this package registers under @_linked/core',
  );
  assert.equal(own.packageName, '@_linked/sentry');
});
