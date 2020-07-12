import React, {useContext, useEffect, useMemo, useState} from 'react';
import {KContext} from './kLogicProvider';
import {pathOr} from 'ramda';

const Dump = () => {
  const context = useContext(KContext);

  const [state, setState] = useState(
    pathOr({}, context.scope, context.getState())
  );

  useEffect(() => {
    const tryUpdateState = () => {
      setState(context.getState());
    };
    const unsubscribe = context.subscribe(tryUpdateState);
    return () => {
      unsubscribe();
    };
  }, []);

  const serializedState = useMemo(() => JSON.stringify(state, null, 2), [
    state,
  ]);

  return (
    <pre style={{margin: 0, fontSize: 11}} title={serializedState}>
      {serializedState}
    </pre>
  );
};

export default Dump;
