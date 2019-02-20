import {runSaga} from 'redux-saga';
import {omit, is, identity, compose, path} from 'ramda';

const matchOperatorsRe = /[|\\{}()[\]^$+*?.]/g;

const escapeStringRegexp = str => {
  if (typeof str !== 'string') {
    throw new TypeError('Expected a string');
  }

  return str.replace(matchOperatorsRe, '\\$&');
};

var createSetContextWarning = function createSetContextWarning(ctx, props) {
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

function emitter() {
  const subscribers = [];

  const subscribe = prefix => sub => {
    subscribers.push({
      prefix,
      sub,
      matcher: matcher(prefix),
    });
    return function() {
      return remove(subscribers, sub);
    };
  };

  function emit(item) {
    const arr = subscribers.slice();
    for (let i = 0, len = arr.length; i < len; i++) {
      const entry = arr[i];
      const match = entry.matcher(item);
      if (match) {
        arr[i].sub({
          ...item,
          type: match.unwrappedType,
        });
      }
    }
  }

  return {
    subscribe: subscribe,
    emit: emit,
  };
}

function check(value, predicate, error) {
  if (!predicate(value)) {
    //log('error', 'uncaught at check', error);
    throw new Error(error);
  }
}

function sagaMiddlewareFactory() {
  var _ref =
    arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : {};

  var _ref$context = _ref.context,
    context = _ref$context === undefined ? {} : _ref$context,
    options = omit(['context'], _ref);
  var sagaMonitor = options.sagaMonitor,
    logger = options.logger,
    onError = options.onError;

  if (is(Function, options)) {
    throw new Error(
      "You passed a function to the Saga middleware. You are likely trying to start a Saga by directly passing it to the middleware. This is no longer possible starting from 0.10.0. To run a Saga, you must do it dynamically AFTER mounting the middleware into the store.\n        Example:\n          import createSagaMiddleware from 'redux-saga'\n          ... other imports\n\n          const sagaMiddleware = createSagaMiddleware()\n          const store = createStore(reducer, applyMiddleware(sagaMiddleware))\n          sagaMiddleware.run(saga, ...args)\n      "
    );
  }

  if (logger && !is(Function, logger)) {
    throw new Error(
      '`options.logger` passed to the Saga middleware is not a function!'
    );
  }

  if ('development' === 'development' && options.onerror) {
    throw new Error(
      '`options.onerror` was removed. Use `options.onError` instead.'
    );
  }

  if (onError && !is(Function, onError)) {
    throw new Error(
      '`options.onError` passed to the Saga middleware is not a function!'
    );
  }

  if (options.emitter && !is(Function, options.emitter)) {
    throw new Error(
      '`options.emitter` passed to the Saga middleware is not a function!'
    );
  }

  function sagaMiddleware(_ref2) {
    var getState = _ref2.getState,
      dispatch = _ref2.dispatch;

    var sagaEmitter = emitter();
    sagaEmitter.emit = (options.emitter || identity)(sagaEmitter.emit);

    sagaMiddleware.run = (prefix, saga, ...args) =>
      runSaga(
        {
          context: context,
          subscribe: sagaEmitter.subscribe(prefix),
          dispatch: prefix
            ? action => dispatch({...action, type: `${prefix}.${action.type}`})
            : dispatch,
          getState: x =>
            console.log('qqqqqqqq', x) ||
            compose(
              prefix ? path(prefix.split('.')) : identity,
              getState
            )(x),
          sagaMonitor: sagaMonitor,
          logger: logger,
          onError: onError,
        },
        saga,
        ...args
      );

    return function(next) {
      return function(action) {
        if (sagaMonitor && sagaMonitor.actionDispatched) {
          sagaMonitor.actionDispatched(action);
        }
        const result = next(action); // hit reducers
        sagaEmitter.emit(action);
        return result;
      };
    };
  }

  sagaMiddleware.run = function() {
    throw new Error(
      'Before running a Saga, you must mount the Saga middleware on the Store using applyMiddleware'
    );
  };

  sagaMiddleware.setContext = function(props) {
    check(props, is(Object), createSetContextWarning('sagaMiddleware', props));
    Object.assign(context, props);
  };

  return sagaMiddleware;
}

const sagaMiddleware = sagaMiddlewareFactory();

export default sagaMiddleware;
