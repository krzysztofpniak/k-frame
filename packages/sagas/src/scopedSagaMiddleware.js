import {runSaga} from 'redux-saga';
import {forwardTo} from '@k-frame/core';
import {identity, compose, path, find, propEq} from 'ramda';
import createMultiScopeChannel from './createMultiScopeChannel';

function sagaMiddlewareFactory({context = {}, sagaMonitor, ...options} = {}) {
  let defaultOptions = null;
  let multiChannel = createMultiScopeChannel();

  function sagaMiddleware({getState, dispatch}) {
    defaultOptions = {
      ...options,
      context,
      dispatch,
      getState,
      sagaMonitor,
    };

    return next => action => {
      if (sagaMonitor && sagaMonitor.actionDispatched) {
        sagaMonitor.actionDispatched(action);
      }
      const result = next(action); // hit reducers

      multiChannel.emit(action);
      return result;
    };
  }

  sagaMiddleware.run = (options, saga, ...args) => {
    if (process.env.NODE_ENV !== 'production' && !defaultOptions) {
      throw new Error(
        'Before running a Saga, you must mount the Saga middleware on the Store using applyMiddleware'
      );
    }

    const finalOptions = {
      ...defaultOptions,
      ...(options || {}),
      getState: s =>
        compose(
          options.scope ? path(options.scope) : identity,
          defaultOptions.getState
        )(s),
      dispatch: forwardTo(defaultOptions.dispatch, ...options.scope),
      channel: multiChannel.getScopeChannel(options.scope),
      context: {...context, ...(options.context || {})},
    };

    return runSaga(finalOptions, saga, ...args);
  };

  sagaMiddleware.setContext = props => {
    context = {...context, ...props};
  };

  return sagaMiddleware;
}

const scopedSagaMiddleware = sagaMiddlewareFactory();

export default scopedSagaMiddleware;
