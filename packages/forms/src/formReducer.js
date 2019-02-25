import {
  assocPath,
  path,
  prop,
  startsWith,
  drop,
  length,
  ifElse,
  always,
  compose,
  evolve,
} from 'ramda';
import {fromTree} from '@k-frame/core';

const kFormsActionPrefix = '@@k-forms/';

const unwrapKFormsAction = ifElse(
  compose(
    startsWith(kFormsActionPrefix),
    prop('type')
  ),
  evolve({type: drop(length(kFormsActionPrefix))}),
  always(null)
);

const reducersTree = {
  current: {},
};

const treeReducer = {
  current: (state = {}, action) => state,
};

const notInitializedError = () =>
  console.error('call registerStore from k-forms first');

const store = {
  current: {
    dispatch: notInitializedError,
    getState: notInitializedError,
    subscribe: notInitializedError,
  },
};

const assocFormReducer = (rPath, reducer) => {
  if (path(rPath, reducersTree.current)) {
    console.error('additional scope is required for: ', rPath);
  } else {
    const newTree = assocPath(rPath, reducer, reducersTree.current);
    reducersTree.current = newTree;
    treeReducer.current = fromTree(newTree);
  }
};

const formReducer = (state = {}, action) => {
  const unwrappedAction = unwrapKFormsAction(action);
  return unwrappedAction ? treeReducer.current(state, unwrappedAction) : state;
};

const registerStore = s =>
  (store.current = {
    dispatch: action =>
      s.dispatch({...action, type: `${kFormsActionPrefix}${action.type}`}),
    getState: () => prop('form', s.getState()),
    subscribe: s.subscribe,
  });

export default formReducer;

export {assocFormReducer, registerStore, store};
