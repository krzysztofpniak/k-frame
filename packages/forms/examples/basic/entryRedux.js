import React from 'react';
import {render} from 'react-dom';
import {createStore, combineReducers} from 'redux';
import {Provider} from 'react-redux';
import App from './components/app';
import appReducer from './components/appReducer';
import formReducer, {registerStore} from '../../src/formReducer';
import formConnect from '../../src/formConnect';

const storeFactory = (typeof window === 'object' &&
  window.__REDUX_DEVTOOLS_EXTENSION__
  ? window.__REDUX_DEVTOOLS_EXTENSION__()
  : a => a)(createStore);

const rootReducer = combineReducers({
  ...appReducer,
  form: formReducer,
});

const store = storeFactory(rootReducer);

registerStore(store);

const run = (containerDomId, View) => {
  render(
    <Provider store={store}>
      <View />
    </Provider>,
    document.getElementById(containerDomId)
  );
};

run('root', App);

if (module.hot) {
  module.hot.accept('./components/app', () => {
    const NextApp = require('./components/app').default;
    run('root', formConnect(NextApp));
  });
}
