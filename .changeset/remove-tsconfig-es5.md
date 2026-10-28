---
'@_linked/sentry': patch
---

Remove the unused `tsconfig-es5.json`. No script referenced it; running it by accident would have overwritten `lib/` with declaration-less ES5. Build output is unchanged.
