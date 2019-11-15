import {runSaga} from 'redux-saga';
import {forwardTo} from '@k-frame/core';
import {
  identity,
  compose,
  path,
  find,
  propEq,
  init,
  forEachObjIndexed,
} from 'ramda';
import createMultiScopeChannel from './createMultiScopeChannel';

const getScopeValue = (scope, key, target) => {
  if (scope.length === 0) {
    return null;
  } else {
    const scopeStr = scope.join('.');
    return target[scopeStr] && target[scopeStr].data[key]
      ? target[scopeStr].data[key]
      : getScopeValue(init(scope), key, target);
  }
};

function sagaMiddlewareFactory({context = {}, sagaMonitor, ...options} = {}) {
  let defaultOptions = null;
  let multiChannel = createMultiScopeChannel();

  const contextStore = {};

  const getScopedContext = scope => {
    const strScope = scope.join('.');
    if (!contextStore[strScope]) {
      const data = {};
      contextStore[strScope] = {
        data,
        proxy: new Proxy(data, {
          get: (target, name) => {
            return getScopeValue(scope, name, contextStore);
          },
          set: function(obj, prop, value) {
            obj[prop] = value;
            return true;
          },
        }),
      };
    }

    return contextStore[strScope].proxy;
  };

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

    const ctx = getScopedContext(options.scope || []);

    forEachObjIndexed((v, k) => {
      ctx[k] = v;
    }, context);

    forEachObjIndexed((v, k) => {
      ctx[k] = v;
    }, options.context || {});

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
      context: ctx,
    };

    return runSaga(finalOptions, saga, ...args);
  };

  sagaMiddleware.setContext = props => {
    //context = {...context, ...props};
  };

  return sagaMiddleware;
}

const scopedSagaMiddleware = sagaMiddlewareFactory();

export default scopedSagaMiddleware;
