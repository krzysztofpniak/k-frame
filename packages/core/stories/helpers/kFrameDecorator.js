import React from 'react';
import {compose, identity} from 'ramda';
import {applyMiddleware, createStore} from 'redux';
import {KProvider} from '../../src/kLogicProvider';

const storeFactory = compose(
  window.__REDUX_DEVTOOLS_EXTENSION__
    ? window.__REDUX_DEVTOOLS_EXTENSION__()
    : identity
)(createStore);

const emptyStore = storeFactory(a => a, {});

const kFrameDecorator = story => (
  <KProvider store={emptyStore}>{story()}</KProvider>
);

export default kFrameDecorator;
