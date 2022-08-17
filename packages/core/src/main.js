import React, {useCallback, useContext, useEffect, useRef} from 'react';
import bindActionCreators from './bindActionCreators';
import Scope from './scope';
import withScope from './withScope';
import withDebug from './withDebug';
import arePropsEqual from './arePropsEqual';
import shallowEqual from './shallowEqual';
import useKReducer from './useKReducer';
import handleAsyncs from './handleAsyncs';
import fromTree from './fromTree'; //?
import createReducer from './createReducer';
import nest from './nest'; //? subReducer
import createPayloadReducer from './createPayloadReducer'; //actionType
import createStateReducer from './createStateReducer'; //actionType2
import wrapAction from './wrapAction';
import forwardTo from './forwardTo';
import composeReducers from './composeReducers';
import emptyReducer from './emptyReducer';
import {KContext, KProvider} from './kLogicProvider';
import createAction from './createAction';
import usePrevious from './usePrevious';
import useScopeProps from './useScopeProps';
import withMemoContext from './withMemoContext';
import {curry, unless, is, objOf, otherwise, then} from 'ramda';
import useWithArgs from './useWithArgs';
import useInputTargetValue from './useInputTargetValue';
import withStaticScope from './withStaticScope';
import useDebounce from './useDebounce';
import useEqualsEffect from './useEqualsEffect';
import {
  AsyncState,
  fromAsyncState,
  isAsyncStateCreated,
  isAsyncStateRunning,
  isAsyncStateCompleted,
  isAsyncStateFaulted,
} from './asyncState';
import useEqualsMemo from './useEqualsMemo';
import {Future, fork} from 'fluture';
import useEqualsUpdateEffect from './useEqualsUpdateEffect';
import useFirstMountState from './useFirstMountState';
import useRefValue from './useRefValue';
import useQueue from './useQueue';
import useDebounceValue from './useDebounceValue';

const asyncActionTypeName = curry(
  (stage, baseType) => `async/${baseType}/${stage}`
);

const createAsyncAction = stage => (baseType, payload) => ({
  type: asyncActionTypeName(stage, baseType),
  payload,
});

const requestAction = createAsyncAction('request');
const succeededAction = createAsyncAction('succeeded');
const chunkAction = createAsyncAction('chunk');
const failedAction = createAsyncAction('failed');

const ensureObject = unless(is(Object), objOf('value'));

const asyncActionExecutor = async (fn, key, dispatch) => {
  try {
    dispatch(requestAction(key));
    const result = await fn();
    dispatch(succeededAction(key, result));
    return result;
  } catch (e) {
    dispatch(failedAction(key, e));
    throw e;
  }
};

const useAsync = (fn, key) => {
  const context = useContext(KContext);

  return useCallback((...args) => {
    return asyncActionExecutor(
      () => context.asyncMiddleware(context.store)(fn)(args),
      key,
      context.dispatch
    );
  }, []);
};

const toCancellablePromise = cancelRef => futureCreator => (...args) =>
  new Promise((resolve, reject) => {
    cancelRef.current = futureCreator(...args) |> fork(reject)(resolve);
  });

const useFuture = (futureCreator, key) => {
  const {dispatch, store, asyncMiddleware} = useContext(KContext);
  const cancelRef = useRef();
  const fn = toCancellablePromise(cancelRef)(futureCreator);

  return (...args) =>
    Future((reject, resolve) => {
      dispatch(requestAction(key));
      asyncMiddleware(store)(fn)(args)
        |> then(result => {
          dispatch(succeededAction(key, result));
          resolve(result);
        })
        |> otherwise(e => {
          dispatch(failedAction(key, e));
          reject(e);
        });

      return () => {
        dispatch(failedAction(key, {message: 'Cancelled'}));
        cancelRef.current();
      };
    });
};

export {
  handleAsyncs,
  KProvider,
  KContext,
  useKReducer,
  useAsync,
  useDebounce,
  useEqualsEffect,
  Scope,
  withScope,
  withDebug,
  shallowEqual,
  arePropsEqual,
  bindActionCreators,
  createReducer,
  createPayloadReducer,
  createStateReducer,
  nest,
  wrapAction,
  forwardTo,
  fromTree,
  composeReducers,
  emptyReducer,
  createAction,
  useInputTargetValue,
  useWithArgs,
  usePrevious,
  useScopeProps,
  useFuture,
  useEqualsUpdateEffect,
  useFirstMountState,
  useRefValue,
  useQueue,
  useDebounceValue,
  requestAction,
  succeededAction,
  chunkAction,
  failedAction,
  withMemoContext,
  withStaticScope,
  AsyncState,
  fromAsyncState,
  useEqualsMemo,
  isAsyncStateCreated,
  isAsyncStateRunning,
  isAsyncStateCompleted,
  isAsyncStateFaulted,
};
