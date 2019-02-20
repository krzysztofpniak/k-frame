import React, {Component, createFactory} from 'react';
import {KContext} from '@k-frame/core';
import {assocFormReducer, store} from './formReducer';

const getContextValue = () => ({
  scope: [],
  assocReducer: assocFormReducer,
  dissocReducer: function dissocReducer() {},
  dispatch: store.current.dispatch,
  runSaga: function runSaga$$1() {},
  getState: store.current.getState,
  subscribe: store.current.subscribe,
  supplied: true,
});

const formConnect = BaseComponent => {
  const factory = createFactory(BaseComponent);
  const contextValue = getContextValue();

  class FormConnect extends Component {
    render() {
      return (
        <KContext.Provider value={contextValue}>
          {factory(this.props)}
        </KContext.Provider>
      );
    }
  }

  return FormConnect;
};

export default formConnect;

export {getContextValue};
