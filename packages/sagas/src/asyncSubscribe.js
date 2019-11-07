import {eventChannel} from 'redux-saga';
import {put, take} from 'redux-saga/effects';
import {chunkAction} from '@k-frame/core';

const observableChannel = observable =>
  eventChannel(emitter => {
    // init the connection here
    observable.subscribe({
      next: data => {
        emitter(data);
      },
    });

    return () => {};
  });

function* asyncSubscribe(baseType, fn, ...args) {
  const channel = yield observableChannel(fn(...args));

  while (true) {
    const chunk = yield take(channel);
    yield put(chunkAction(baseType, chunk));
  }
}

export default asyncSubscribe;
