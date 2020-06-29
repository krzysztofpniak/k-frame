import React from 'react';
import {compose, identity} from 'ramda';
import {applyMiddleware, createStore} from 'redux';
import {scopedSagaMiddleware} from '@k-frame/sagas';
import {KProvider} from '@k-frame/core';

const storeFactory = compose(
  applyMiddleware(scopedSagaMiddleware),
  window.__REDUX_DEVTOOLS_EXTENSION__
    ? window.__REDUX_DEVTOOLS_EXTENSION__()
    : identity
)(createStore);

const emptyStore = storeFactory(a => a, {});

const kFrameDecorator = story => (
  <KProvider store={emptyStore} runSaga={scopedSagaMiddleware.run}>
    {story()}
  </KProvider>
);

export default kFrameDecorator;
