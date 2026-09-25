---
'@_linked/sentry': patch
---

Give this package its own linked identity

`src/package.ts` re-exported core's decorators verbatim and declared
`packageName` as a bare literal that nothing was bound to, so everything
declared here registered under `@_linked/core`: the `sentry` ontology landed in
core's entry in the package tree, and the next `@linkedShape` added here would
silently have been given a `.../shape/core/...` IRI. `Server.call` routes on
the package name a shape carries, so one naming the wrong package is simply
unreachable.

**No shape IRI changes**, because no shape is decorated here today — that is
why this is a patch and not a minor. The only visible change is where the
`sentry` ontology is registered in the package tree.

Same defect and same fix as linked-fw/owl#26, where shapes did exist and the
IRIs did change.
