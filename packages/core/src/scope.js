import React, {useContext, useMemo} from 'react';
import {forwardTo} from '@k-frame/reducers';
import {KContext} from './kLogicProvider';

const Scope = ({scope, children}) => {
  const context = useContext(KContext);
  const scopeArray = useMemo(() => scope.split('.'), [scope]);
  const newScope = useMemo(() => [...context.scope, ...scopeArray], [
    context.scope,
    scopeArray,
  ]);
  const dispatch = useMemo(() => forwardTo(context.dispatch, ...scopeArray), [
    scopeArray,
    context.dispatch,
  ]);
  const newContext = useMemo(
    () => ({
      ...context,
      scope: newScope,
      dispatch,
    }),
    [newScope, dispatch]
  );

  return (
    <KContext.Provider value={newContext}>
      {children}
    </KContext.Provider>
  );
};

export default Scope;
