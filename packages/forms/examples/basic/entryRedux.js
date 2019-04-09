import React from 'react';
import {render} from 'react-dom';
import {createStore, combineReducers} from 'redux';
import {Provider} from 'react-redux';
import SimpleForm from '../common/simpleForm';
import formReducer, {registerStore} from '../../src/formReducer';
import {emptyReducer} from '@k-frame/core';

const storeFactory = (typeof window === 'object' &&
  window.__REDUX_DEVTOOLS_EXTENSION__
  ? window.__REDUX_DEVTOOLS_EXTENSION__()
  : a => a)(createStore);

const rootReducer = combineReducers({
  ...emptyReducer,
  form2: formReducer,
});

const store = storeFactory(rootReducer);

registerStore(store, 'form2');

const run = (containerDomId, View) => {
  render(
    <Provider store={store}>
      <View />
    </Provider>,
    document.getElementById(containerDomId)
  );
};

run('root', SimpleForm);

if (module.hot) {
  module.hot.accept('../common/simpleForm', () => {
    const SimpleForm = require('../common/simpleForm').default;
    run('root', SimpleForm);
  });
}
