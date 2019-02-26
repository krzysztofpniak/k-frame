import React from 'react';
import ReactDOM from 'react-dom';
import {createStore} from 'redux';
import {KProvider, emptyReducer} from '@k-frame/core';
import './index.css';
import App from './App';
import * as serviceWorker from './serviceWorker';

const storeFactory = (window.__REDUX_DEVTOOLS_EXTENSION__
  ? window.__REDUX_DEVTOOLS_EXTENSION__()
  : f => f)(createStore);

const store = storeFactory(emptyReducer);

ReactDOM.render(
  <KProvider store={store}>
    <App />
  </KProvider>,
  document.getElementById('root')
);

// If you want your app to work offline and load faster, you can change
// unregister() to register() below. Note this comes with some pitfalls.
// Learn more about service workers: http://bit.ly/CRA-PWA
serviceWorker.unregister();
