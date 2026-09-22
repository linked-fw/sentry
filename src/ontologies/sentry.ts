import { Prefix } from '@_linked/core/utils/Prefix';
import { createNameSpace } from '@_linked/core/utils/NameSpace';
import { linkedOntology } from '../package.js';
import * as _this from './sentry.js';

const dataFile = '../data/sentry.json';
const base = 'http://lincd.org/ont/sentry/';

Prefix.add('sentry', base);

export const loadData = () => {
  //@ts-ignore
  return import(/* @vite-ignore */ dataFile, { with: { type: 'json' } }).then(
    (data) => data.default
  );
};

export const ns = createNameSpace(base);

export const _self = ns('');
export const ExampleClass = ns('ExampleClass');
export const exampleProperty = ns('exampleProperty');

export const sentry = {
  _self,
  ExampleClass,
  exampleProperty,
};

linkedOntology(_this, ns, 'sentry', loadData, dataFile);
