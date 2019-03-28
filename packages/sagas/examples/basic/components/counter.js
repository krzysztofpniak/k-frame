import React, {useEffect} from 'react';
import {assoc} from 'ramda';
import {put, delay} from 'redux-saga/effects';
import {
  createPayloadReducer,
  createAction,
  createReducer,
  withScope,
  useKReducer,
} from '@k-frame/core';
import useSagaRunner from '../../../src/useSagaRunner';

const actions = {
  setCounter: createAction('setCounter'),
};

const reducer = createReducer({counter: 0}, [
  createPayloadReducer(actions.setCounter, assoc('counter')),
]);

const infiniteCounterSaga = function*() {
  let counter = 0;
  while (true) {
    counter++;
    yield delay(1000);
    yield put(actions.setCounter(counter));
  }
};

const Counter = withScope(() => {
  const {counter} = useKReducer(reducer, actions);
  const {fork, tasks} = useSagaRunner();

  useEffect(() => {
    fork('infCounter', infiniteCounterSaga);
  }, []);

  return (
    <div>
      <pre>{JSON.stringify(tasks, null, 2)}</pre>
      <div>{counter}</div>
      {tasks.infCounter && (
        <button type="button" onClick={tasks.infCounter.cancel}>
          cancel counter
        </button>
      )}
    </div>
  );
});

export default Counter;
