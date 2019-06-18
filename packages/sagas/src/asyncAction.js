import {call, put} from 'redux-saga/effects';
import {requestAction, succeededAction, failedAction} from '@k-frame/core';

function* asyncAction(baseType, fn, ...args) {
  try {
    yield put(requestAction(baseType));
    const result = yield call(fn, ...args);
    yield put(succeededAction(baseType, result));
    return result;
  } catch (e) {
    yield put(failedAction(baseType, e));
    throw e;
  }
}

export default asyncAction;
