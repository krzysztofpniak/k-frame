import {reduce} from 'ramda';
import mergeDeepRight from './mergeDeepRight';

const composeReducers = (...reducers) => (state, action) => {
  if (state) {
    return reduce((s, reducer) => reducer(s, action), state, reducers);
  } else {
    return reduce(
      (s, reducer) => mergeDeepRight(s, reducer(undefined, action)),
      undefined,
      reducers
    );
  }
};

export default composeReducers;
