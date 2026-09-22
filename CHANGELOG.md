# @\_linked/sentry

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
