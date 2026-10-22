---
'@_linked/sentry': minor
---

The ontology registers without data. `src/data/sentry.json` held a placeholder (`sentry:ExampleClass`, which nothing uses), so it is deleted and
the ontology no longer passes a `loadData`; apps stop logging that its data "is not Turtle text;
skipped".

- **Breaking:** the `loadData` export of `ontologies/sentry` is removed, and `data/sentry.json` is no
  longer in `lib/esm/`.
