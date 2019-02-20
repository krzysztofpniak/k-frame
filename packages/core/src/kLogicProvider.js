import React, {
  createContext,
  useCallback,
  useMemo,
  useRef,
  useState,
} from 'react';
import {assocPath, dissocPath, path} from 'ramda';
import {fromTree, composeReducers} from '@k-frame/reducers';

const defaultContextValue = {
  scope: [],
  assocReducer: () => {},
  dissocReducer: () => {},
  dispatch: () => {},
  runSaga: () => {},
  getState: () => {},
  subscribe: () => {},
  supplied: false,
};

const KContext = createContext(defaultContextValue);

function KProvider({store, runSaga, staticReducer, children}) {
  const [context, setContext] = useState(defaultContextValue);
  const reducersTree = useRef({});

  const assocReducer = useCallback(
    (rPath, reducer) => {
      if (path(rPath, reducersTree.current)) {
        console.error('additional scope is required for: ', rPath);
      } else {
        const newTree = assocPath(rPath, reducer, reducersTree.current);
        reducersTree.current = newTree;
        const treeReducer = fromTree(newTree);
        const finalReducer = staticReducer
          ? composeReducers(staticReducer, treeReducer)
          : treeReducer;
        store.replaceReducer(finalReducer);
        //setState(store.getState());
      }
    },
    [store]
  );

  const dissocReducer = useCallback(
    rPath => {
      console.log('dissocReducer');
      /*
      if (!path(rPath, reducersTree.current)) {
        console.warning('additional scope is required for: ', rPath);
      } else {
        const newTree = dissocPath(rPath, reducersTree.current);
        reducersTree.current = newTree;
        store.replaceReducer(fromTree(newTree));
        setContext({...context, state: store.getState()});
      }
      */
    },
    [store]
  );

  const contextValue = useMemo(
    () => ({
      ...context,
      assocReducer,
      dissocReducer,
      dispatch: store.dispatch,
      getState: store.getState,
      subscribe: store.subscribe,
      runSaga,
      supplied: true,
    }),
    [runSaga, assocReducer, dissocReducer]
  );

  return (
    <KContext.Provider value={contextValue}>
      {children}
    </KContext.Provider>
  );
}

export {KContext, KProvider};
