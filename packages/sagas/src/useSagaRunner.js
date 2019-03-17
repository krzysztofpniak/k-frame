import {useCallback, useContext, useMemo, useEffect, useRef} from 'react';
import {KContext} from '@k-frame/core';
import {keys, map} from 'ramda';

const useObjectValues = obj => {
  const objKeys = useMemo(() => keys(obj), []);
  const objValues = map(k => obj[k], objKeys);
  return objValues;
};

const useSagaRunner = sagaContext => {
  const context = useContext(KContext);

  const argsValues = useObjectValues(sagaContext);

  const tasksRef = useRef([]);

  useEffect(() => {
    tasksRef.current = [];
    return () => {
      const tasks = tasksRef.current;
      for (let i = 0; i < tasks.length; i++) {
        tasks[i].cancel();
      }
      tasksRef.current = [];
    };
  }, []);

  const runSaga = useCallback(
    (saga, ...args) => {
      const task = context.runSaga(
        {scope: context.scope, context: sagaContext},
        saga,
        ...args
      );
      tasksRef.current.push(task);
      return task;
    },
    [context.scope, ...argsValues]
  );

  return runSaga;
};

export default useSagaRunner;
