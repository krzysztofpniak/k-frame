import React, {useCallback, useContext, useEffect} from 'react';
import {KContext} from '@k-frame/core';
import sagaMiddleware from './sagaMiddleware';
import useSagaRunner from './useSagaRunner';
import {curry, unless, is, objOf} from 'ramda';
import {call, put, takeEvery} from 'redux-saga/effects';

const asyncActionTypeName = curry(
  (stage, baseType) => `Async/${baseType}/${stage}`
);
const succeedAsyncActionName = asyncActionTypeName('Succeeded');
const failedAsyncActionName = asyncActionTypeName('Failed');
const requestedAsyncActionName = asyncActionTypeName('Request');

const createAsyncAction = stage => (baseType, payload) => ({
  type: asyncActionTypeName(stage, baseType),
  payload,
});

const requestAction = createAsyncAction('Request');
const succeededAction = createAsyncAction('Succeeded');
const failedAction = createAsyncAction('Failed');

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

const fetchOnEvery = ({actions, resourceKey, fn, argsSelector}) =>
  function*() {
    yield takeEvery(actions, function*() {
      yield* asyncAction({
        baseType: resourceKey,
        fn,
        args: [],
      });
    });
  };

const ensureObject = unless(is(Object), objOf('value'));

const useSaga = (saga, args = [], dependencies = []) => {
  const context = useContext(KContext);

  return useEffect(() => {
    context.runSaga(context.scope.join('.'), saga, ...args);
  }, dependencies);
};

export {
  asyncAction,
  fetchOnEvery,
  sagaMiddleware,
  useSaga,
  useSagaRunner,
};
