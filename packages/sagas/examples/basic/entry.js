import React from 'react';
import {render} from 'react-dom';
import {createStore, compose, applyMiddleware} from 'redux';
import App from './components/app';
import {KProvider, emptyReducer} from '@k-frame/core';
import {scopedSagaMiddleware} from '../../src/main';

const composeEnhancers =
  typeof window === 'object' && window.__REDUX_DEVTOOLS_EXTENSION_COMPOSE__
    ? window.__REDUX_DEVTOOLS_EXTENSION_COMPOSE__({
        // Specify extension’s options like name, actionsBlacklist, actionsCreators, serialize...
      })
    : compose;

const store = createStore(
  emptyReducer,
  composeEnhancers(applyMiddleware(scopedSagaMiddleware))
);

const rootReducer = (state = {xxx: 'test'}, action) =>
  action.type === 'Hopla' ? {...state, xxx: action.payload} : state;

const run = (containerDomId, View) => {
  render(
    <KProvider
      store={store}
      runSaga={scopedSagaMiddleware.run}
      staticReducer={rootReducer}
    >
      <View />
    </KProvider>,
    document.getElementById(containerDomId)
  );
};

run('root', App);

if (module.hot) {
  module.hot.accept('./components/app', () => {
    const NextApp = require('./components/app').default;
    run('root', NextApp);
  });
}
