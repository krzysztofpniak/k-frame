import '@babel/polyfill';
import React from 'react';
import {render} from 'react-dom';
import {createStore} from 'redux';
import {KProvider, emptyReducer} from '@k-frame/core';
const App = require(COMPONENT_PATH).default;

const storeFactory = (typeof window === 'object' &&
  window.__REDUX_DEVTOOLS_EXTENSION__
  ? window.__REDUX_DEVTOOLS_EXTENSION__()
  : a => a)(createStore);

const store = storeFactory(emptyReducer);

const run = (containerDomId, View) => {
  render(
    <KProvider store={store}>
      <View />
    </KProvider>,
    document.getElementById(containerDomId)
  );
};

run('root', App);

if (module.hot) {
  module.hot.accept(COMPONENT_PATH, () => {
    const NextApp = require(COMPONENT_PATH).default;
    run('root', NextApp);
  });
}
