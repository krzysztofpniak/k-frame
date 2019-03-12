import React, {useContext, useMemo} from 'react';
import forwardTo from './forwardTo';
import {KContext} from './kLogicProvider';

const Scope = ({scope, children}) => {
  const context = useContext(KContext);

  if (!context.supplied) {
    console.error(
      '<Scope> requires <KProvider> at the top of the application.'
    );
    return null;
  }

  if (!scope) {
    console.error('<Scope> component requires scope param.');
    return null;
  }

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

  return <KContext.Provider value={newContext}>{children}</KContext.Provider>;
};

export default Scope;
