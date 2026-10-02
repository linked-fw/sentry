---
'@_linked/sentry': minor
---

The sentry ontology moves from `http://lincd.org/ont/sentry/` to `https://linked.cm/ont/sentry/`, the first-party scheme every public package uses (`https://linked.cm/ont/{publicSlug}/`).

No data migration is needed: its terms (`sentry.ExampleClass`, `sentry.exampleProperty`) are scaffold placeholders that nothing uses, and no stored data or shape carries them. The prefix key (`sentry`) and the `ontologies/sentry` module are unchanged.
