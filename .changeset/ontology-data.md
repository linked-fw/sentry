---
'@_linked/sentry': minor
---

Ontology data: labels, descriptions and types for every term.

- `src/data/sentry.ttl`, copied into `lib/esm/data/` by the build, is the ontology's data: the
  ontology node (`dcterms:title`, `dcterms:description`, `owl:versionInfo`) and every term of
  `ontologies/sentry`, each typed (`owl:Class`, `owl:ObjectProperty` or `owl:DatatypeProperty`) with an
  English `rdfs:label` and `rdfs:comment`, in the deterministic Turtle form.
- `ontologies/sentry` exports `dataFiles` and `loadData` (read through
  `@_linked/core/ontology/loadOntologyFiles`, server only), and the register module passes both, so
  the ontology sync and the shape check read the data.
- **Breaking:** `src/data/sentry.json` (a placeholder) is deleted, so `data/sentry.json` is no longer in
  `lib/esm/`, and `loadData()` resolves to the Turtle text (`string[]`) instead of a JSON-LD document.
