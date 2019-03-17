import {runSaga, stdChannel} from 'redux-saga';
import {forwardTo} from '@k-frame/core';
import {omit, is, identity, compose, path, find, propEq} from 'ramda';

const matchOperatorsRe = /[|\\{}()[\]^$+*?.]/g;

const escapeStringRegexp = str => {
  if (typeof str !== 'string') {
    throw new TypeError('Expected a string');
  }

  return str.replace(matchOperatorsRe, '\\$&');
};

const createSetContextWarning = function createSetContextWarning(ctx, props) {
  return (
    (ctx ? ctx + '.' : '') +
    'setContext(props): argument ' +
    props +
    ' is not a plain object'
  );
};

function remove(array, item) {
  var index = array.indexOf(item);
  if (index >= 0) {
    array.splice(index, 1);
  }
}

const matcher = pattern => {
  const regexp = new RegExp(`^${escapeStringRegexp(pattern)}\\.(.+)`);

  return action => {
    if (action.type === pattern || pattern === '') {
      return {
        id: pattern,
        wrap: type => type,
        unwrappedType: action.type,
        args: {},
      };
    } else {
      const match = action.type.match(regexp);

      if (match) {
        const unwrappedType = match[1];

        return {
          id: `${pattern}.`,
          wrap: type => `${pattern}.${type}`,
          unwrappedType,
          args: {},
        };
      } else {
        return false;
      }
    }
  };
};

const createMultiChannel = () => {
  const subscribers = [];

  const getScopeChannel = scope => {
    const prefix = scope.join('.');

    let entry = find(propEq('prefix', prefix), subscribers);
    if (!entry) {
      entry = {
        prefix,
        channel: stdChannel(),
        matcher: matcher(prefix),
      };
      subscribers.push(entry);
    }

    return entry.channel;
  };

  const emit = item => {
    const arr = [...subscribers];
    for (let i = 0, len = arr.length; i < len; i++) {
      const entry = arr[i];
      const match = entry.matcher(item);
      if (match) {
        arr[i].channel.put({
          ...item,
          type: match.unwrappedType,
        });
      }
    }
  };

  return {
    getScopeChannel,
    emit,
  };
};

function sagaMiddlewareFactory({context = {}, sagaMonitor, ...options} = {}) {
  let defaultOptions = null;
  let multiChannel = createMultiChannel();

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
