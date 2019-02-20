import React, {useCallback, useContext, useEffect} from 'react';
import bindActionCreators from './bindActionCreators';
import Scope from './scope';
import withScope from './withScope';
import withDebug from './withDebug';
import shallowEqual from './shallowEqual';
import useKReducer from './useKReducer';
import handleAsyncs from './handleAsyncs';
import {KContext, KProvider} from './kLogicProvider';
import {curry, unless, is, objOf} from 'ramda';

const asyncActionTypeName = curry(
  (stage, baseType) => `Async/${baseType}/${stage}`
);

const createAsyncAction = stage => (baseType, payload) => ({
  type: asyncActionTypeName(stage, baseType),
  payload,
});

const requestAction = createAsyncAction('Request');
const succeededAction = createAsyncAction('Succeeded');
const failedAction = createAsyncAction('Failed');

const ensureObject = unless(is(Object), objOf('value'));

const asyncAction2 = async (fn, key, dispatch) => {
  try {
    dispatch(requestAction(key));
    const result = await fn();
    dispatch(succeededAction(key, result));
    return result;
  } catch (e) {
    dispatch(failedAction(key, e));
  }
};

const useAsync = (fn, key) => {
  const context = useContext(KContext);

  return useCallback(() => {
    asyncAction2(fn, key, context.dispatch).then();
  }, []);
};

export {
  handleAsyncs,
  KProvider,
  KContext,
  useKReducer,
  useAsync,
  Scope,
  withScope,
  withDebug,
  shallowEqual,
  bindActionCreators,
};
