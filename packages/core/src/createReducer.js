import {reduce} from 'ramda';
import mergeDeepRight from './mergeDeepRight';

const createReducer = (initialState, spec) => {
  let desiredInitialState = null;
  return (state, action = {}) => {
    if (!desiredInitialState) {
      desiredInitialState = reduce(
        (s, f) => mergeDeepRight(s, f(undefined, {type: '@@INIT'}) || {}),
        initialState,
        spec
      );
    }

    const calculatedState = mergeDeepRight(desiredInitialState, state || {});

    return reduce((s, f) => f(s, action), calculatedState, spec);
  };
};

export default createReducer;
