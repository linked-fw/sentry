import assert from 'node:assert/strict';
import {existsSync, readFileSync} from 'node:fs';
import test from 'node:test';

/**
 * Every file package.json points a consumer at must exist after `npm run build`.
 * `main` used to name lib/cjs/index.js, which this package's build has never
 * produced — it is ESM-only (`"type": "module"`, an import-only exports map) —
 * so the published package's `main` resolved to nothing for any tool that reads
 * it instead of `exports`. Run after the build, so this checks the output, not
 * the intent.
 */

const root = new URL('../', import.meta.url);
const pkg = JSON.parse(readFileSync(new URL('package.json', root), 'utf8'));

// `types` is left out on purpose: it is "index.d.ts", which the `typesVersions`
// map ("*" -> "lib/esm/*") rewrites to lib/esm/index.d.ts for resolvers that
// ignore `exports`. Pointing it at lib/esm directly breaks those resolvers.
test('main and module point at built files', () => {
  for (const field of ['main', 'module']) {
    if (!pkg[field]) continue;
    assert.ok(
      existsSync(new URL(pkg[field], root)),
      `package.json "${field}" is ${pkg[field]}, which the build did not produce`,
    );
  }
});

test('the root export points at built files', () => {
  for (const [condition, target] of Object.entries(pkg.exports['.'])) {
    assert.ok(
      existsSync(new URL(target, root)),
      `exports["."].${condition} is ${target}, which the build did not produce`,
    );
  }
});
