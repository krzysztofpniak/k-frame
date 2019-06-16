import React, {useCallback, useContext, useEffect} from 'react';
import {
  KContext,
  requestAction,
  succeededAction,
  failedAction,
} from '@k-frame/core';
import scopedSagaMiddleware from './scopedSagaMiddleware';
import useSagaRunner from './useSagaRunner';
import asyncAction from './asyncAction';

const useSaga = (saga, args = [], dependencies = []) => {
  const context = useContext(KContext);

  return useEffect(() => {
    const sagaTask = context.runSaga({scope: context.scope}, saga, ...args);
    return () => {
      sagaTask.cancel();
    };
  }, dependencies);
};

export {asyncAction, scopedSagaMiddleware, useSaga, useSagaRunner};
