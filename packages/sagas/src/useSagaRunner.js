import {useCallback, useContext} from 'react';
import {KContext} from '@k-frame/core';

const useSagaRunner = () => {
  const context = useContext(KContext);

  const runSaga = useCallback(
    (saga, ...args) => {
      context.runSaga(context.scope.join('.'), saga, ...args);
    },
    [context.scope]
  );

  return runSaga;
};

export default useSagaRunner;
