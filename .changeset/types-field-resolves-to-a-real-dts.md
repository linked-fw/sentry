---
'@_linked/sentry': patch
---

Point `types` at `index.d.ts` so a bare import gets types under node10 resolution.

`typesVersions` (`{"*": {"*": ["lib/esm/*"]}}`) is applied to the root `types` value, so the
previous value resolved to a path under `lib/esm/` that the build never emits. Subpath imports
resolved fine through `exports`, which hid the failure from a bare `import … from '@_linked/sentry'`.
