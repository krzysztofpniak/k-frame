import {reduce, mergeDeepRight} from 'ramda';
import shallowEqual from './shallowEqual';

const createReducer = (initialState, spec) => {
  return (state, action = {}) => {
    if (!state) {
      let desiredInitialState = reduce(
        (s, f) => mergeDeepRight(s, f(undefined, {type: '@@INIT'}) || {}),
        initialState,
        spec
      );
      if (shallowEqual(desiredInitialState, initialState)) {
        desiredInitialState = initialState;
      }
      state = mergeDeepRight(desiredInitialState, state || {});
    }

    return reduce((s, f) => f(s, action), state, spec);
  };
};

export default createReducer;
