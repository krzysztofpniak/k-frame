import React from 'react';
import {render} from 'react-dom';
import {createStore} from 'redux';
import {identity} from 'ramda';
import App from './components/app';
import {KProvider, emptyReducer} from '../../src/main';

const storeFactory = (typeof window === 'object' &&
  window.__REDUX_DEVTOOLS_EXTENSION
  ? window.__REDUX_DEVTOOLS_EXTENSION()
  : identity)(createStore);

const store = storeFactory(emptyReducer);

const rootReducer = (state = {xxx: 'test'}, action) =>
  action.type === 'Hopla' ? {...state, xxx: action.payload} : state;

const run = (containerDomId, View) => {
  render(
    <KProvider store={store} staticReducer={rootReducer}>
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
