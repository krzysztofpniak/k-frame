import React, {useCallback} from 'react';
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

const countdownSaga = function*(from) {
  for (let counter = from; counter >= 0; counter--) {
    yield put(actions.setCounter(counter));
    if (counter > 0) {
      yield delay(1000);
    }
  }

  return 'finished';
};

const Countdown = withScope(() => {
  const {counter} = useKReducer(reducer, actions);
  const {fork, tasks} = useSagaRunner();

  const startCountdown = useCallback(() => {
    fork('countdown', countdownSaga, 10);
  }, []);

  return (
    <div>
      <button type="button" onClick={startCountdown}>
        Start countdown
      </button>
      {tasks.countdown && (
        <button type="button" onClick={tasks.countdown.cancel}>
          Stop countdown
        </button>
      )}
      {tasks.countdown && <div>{counter}</div>}
      <pre>{JSON.stringify(tasks, null, 2)}</pre>
    </div>
  );
});

export default Countdown;
