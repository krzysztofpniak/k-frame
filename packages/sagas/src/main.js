import React, {useCallback, useContext, useEffect} from 'react';
import {
  KContext,
  requestAction,
  succeededAction,
  failedAction,
} from '@k-frame/core';
import scopedSagaMiddleware from './scopedSagaMiddleware';
import useSagaRunner from './useSagaRunner';
import {call, put} from 'redux-saga/effects';

function* asyncAction({baseType, fn, args}) {
  try {
    yield put(requestAction(baseType));
    const result = yield call(fn, ...(args || []));
    yield put(succeededAction(baseType, result));
    return result;
  } catch (e) {
    yield put(failedAction(baseType, e));
  }
}

const useSaga = (saga, args = [], dependencies = []) => {
  const context = useContext(KContext);

  return useEffect(() => {
    context.runSaga({scope: context.scope}, saga, ...args);
  }, dependencies);
};

export {asyncAction, scopedSagaMiddleware, useSaga, useSagaRunner};
