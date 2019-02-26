import React from 'react';
import {
  createReducer,
  createStateReducer,
  useKReducer,
  withScope,
} from '@k-frame/core';

const counterActions = {
  inc: () => ({type: 'increment'}),
};

const counterReducer = createReducer({counter: 0}, [
  createStateReducer(counterActions.inc, s => ({
    ...s,
    counter: s.counter + 1,
  })),
]);

const Counter = withScope(() => {
  const {counter, inc} = useKReducer(counterReducer, counterActions);

  return (
    <button type="button" onClick={inc}>
      Clicked {counter} times
    </button>
  );
});

export default Counter;
