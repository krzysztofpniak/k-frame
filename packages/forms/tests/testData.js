import React from 'react';
import {KProvider, Scope} from '@k-frame/core';
import FormContext from '../src/FormContext';

const counterState0 = {
  counter: 0,
};

const counterState1 = {
  counter: 1,
};

const counterActionIncBy = by => ({type: 'IncBy', payload: by});

const counterActionInc = () => ({type: 'Inc'});

const counterActions = {
  inc: counterActionInc,
  incBy: counterActionIncBy,
};

const counterReducer = (state = counterState0, action) => {
  switch (action.type) {
    case 'IncBy':
      return {
        ...state,
        counter: state.counter + action.payload,
      };
    case 'Inc':
      return {
        ...state,
        counter: state.counter + 1,
      };
    default:
      return state;
  }
};

const textStateEmpty = {
  text: '',
};

const textStateHello = {
  text: 'Hello',
};

const textActionSet = text => ({type: 'SetText', payload: text});

const textReducer = (state = textStateEmpty, action) => {
  switch (action.type) {
    case 'SetText':
      return {
        ...state,
        text: action.payload,
      };
    default:
      return state;
  }
};

const someRandomAction = () => ({type: 'SomeRAnd0mAction'});
const initAction = () => ({type: '@@INIT'});

const createStoreMock = () => ({
  dispatch: jest.fn(),
  getState: jest.fn(),
  subscribe: jest.fn(() => jest.fn()),
  replaceReducer: jest.fn(),
});

const createObservableMock = () => ({
  subscribe: jest.fn(() => jest.fn()),
});

const wrapWithKContext = (scope, store) => ({
  wrapper: props => (
    <KProvider store={store}>
      <Scope scope={scope} {...props} />
    </KProvider>
  ),
});

const wrapWithFormContext = formContext => ({
  wrapper: props => <FormContext.Provider value={formContext} {...props} />,
});

export {
  counterState0,
  counterState1,
  counterActionIncBy,
  counterActionInc,
  counterActions,
  counterReducer,
  textStateEmpty,
  textStateHello,
  textActionSet,
  textReducer,
  someRandomAction,
  initAction,
  createStoreMock,
  wrapWithKContext,
  wrapWithFormContext,
  createObservableMock,
};
