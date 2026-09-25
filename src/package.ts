import {linkedPackage} from '@_linked/core/utils/Package';

/**
 * This package's own linked identity.
 *
 * It used to re-export core's decorators verbatim and declare `packageName`
 * as a bare literal that nothing was bound to. The decorators therefore came
 * from `corePackage`, so everything declared here registered under
 * `@_linked/core`: this package's ontology landed in core's entry in the
 * package tree, and the next shape added here would silently have been given a
 * `.../shape/core/...` IRI. That IRI is persisted data and `Server.call`
 * routes on the package name inside it, so a shape naming the wrong package is
 * simply unreachable.
 *
 * No shape is decorated here today, so nothing was mis-registered — the cost
 * was waiting for the first one. Same defect, same fix, as linked-fw/owl#26.
 */
export const {
  linkedShape,
  linkedUtil,
  linkedOntology,
  registerPackageExport,
  registerPackageModule,
  getPackageShape,
  packageExports,
  packageName,
} = linkedPackage('@_linked/sentry');
