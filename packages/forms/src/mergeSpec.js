import {curry, mergeRight, applySpec} from 'ramda';

const mergeSpec = curry((spec, obj) => mergeRight(obj, applySpec(spec)(obj)));

export default mergeSpec;
