# @\_linked/sentry

## 1.0.9

### Patch Changes

- [#18](https://github.com/linked-fw/sentry/pull/18) [`1c8b842`](https://github.com/linked-fw/sentry/commit/1c8b842d44a0bb522468218bdc883d08564f5f29) Thanks [@flyon](https://github.com/flyon)! - Point `types` at `index.d.ts` so a bare import gets types under node10 resolution.

  `typesVersions` (`{"*": {"*": ["lib/esm/*"]}}`) is applied to the root `types` value, so the
  previous value resolved to a path under `lib/esm/` that the build never emits. Subpath imports
  resolved fine through `exports`, which hid the failure from a bare `import … from '@_linked/sentry'`.

## 1.0.8

### Patch Changes

- [#16](https://github.com/linked-fw/sentry/pull/16) [`a1c5c28`](https://github.com/linked-fw/sentry/commit/a1c5c28112cdb30ec665480a324c990d077d1cac) Thanks [@flyon](https://github.com/flyon)! - The ontology no longer registers by importing itself.

  It carried `import * as _this from './<prefix>.js'` and passed that namespace to
  `linkedOntology()`. Under `tsc` the self-reference survives; under a bundler it does
  not — Rollup treats it as a circular import and elides it, so the binding is
  `undefined` and a consuming app dies at boot with `_this is not defined`.

  Registration now lives in a `<prefix>.register.ts` sibling, imported from the package
  entry. Nothing changes for consumers: importing this package still registers the
  ontology.

## 1.0.7

### Patch Changes

- [#14](https://github.com/linked-fw/sentry/pull/14) [`8e58894`](https://github.com/linked-fw/sentry/commit/8e58894ef9044428f0d177c6191055fdd71ad041) Thanks [@flyon](https://github.com/flyon)! - Compile the whole `src` folder, and let a bare import resolve under Node10.

  The build only emitted what an entry transitively reached, so any module
  nothing imported was never built — and never type-checked, so it rotted
  quietly. `include` now covers `src/**/*` with tests excluded explicitly.

  `typesVersions` maps every specifier through `lib/esm/*`, so a `types` value
  that already carried that prefix had it applied twice and no consumer on
  classic Node10 resolution could `import` the package by its bare name.

## 1.0.6

### Patch Changes

- [#11](https://github.com/linked-fw/sentry/pull/11) [`5e93859`](https://github.com/linked-fw/sentry/commit/5e9385914e7aa4aa978b67a8a4cf6311ffe97ab5) Thanks [@flyon](https://github.com/flyon)! - Declare npm as the package manager for this repo, convert the build scripts off `yarn`, and mark `package-lock.json` as a generated file.

## 1.0.3

### Patch Changes

- [#3](https://github.com/linked-cm/sentry/pull/3) [`77123bb`](https://github.com/linked-cm/sentry/commit/77123bbfed00a40a5225e4f73d0470caf888fa67) Thanks [@flyon](https://github.com/flyon)! - loadData: ESM-only JSON import — drop the dead CJS branch, add the `{ with: { type: 'json' } }` import attribute.

## 1.0.2

### Patch Changes

- [`25d0591`](https://github.com/linked-cm/sentry/commit/25d059155ddc87bd091b16331b5b293405a7efb8) - Initial release under the new publishing setup.
