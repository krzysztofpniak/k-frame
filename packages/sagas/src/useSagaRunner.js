import {
  useCallback,
  useContext,
  useMemo,
  useEffect,
  useRef,
  useState,
} from 'react';
import {KContext, useScopeProps} from '@k-frame/core';
import {keys, map, assoc} from 'ramda';

const useObjectValues = obj => {
  const objKeys = useMemo(() => keys(obj), []);
  const objValues = map(k => obj[k], objKeys);
  return objValues;
};

const notImplementedYet = () => {
  throw new Error('this function is not implemented yet');
};

const parseSagaArgs = props => {
  let name, saga, args;

  if (typeof props[0] === 'string') {
    [name, saga, ...args] = props;
  } else {
    [saga, ...args] = props;
  }

  return [name, saga, args];
};

const useSagaRunner = sagaContext => {
  const context = useContext(KContext);
  if (!context.supplied) {
    console.error(
      'KContext not found. Please place <KProvider store={store} runSaga={scopedSagaMiddleware.run}> at the top of the application.'
    );
    return;
  }
  if (!context.runSaga) {
    console.error(
      'runSaga not found in <KProvider>. Please place <KProvider store={store} runSaga={scopedSagaMiddleware.run}> at the top of the application.'
    );
    return;
  }
  const {get, set, over} = useScopeProps();
  const [tasks, setTasks] = useState({});

  const argsValues = useObjectValues(sagaContext);

  const forkedTasksRef = useRef([]);

  useEffect(() => {
    forkedTasksRef.current = [];
    return () => {
      const tasks = forkedTasksRef.current;
      for (let i = 0; i < tasks.length; i++) {
        tasks[i].cancel();
      }
      forkedTasksRef.current = [];
    };
  }, []);

  const updateTask = useCallback((name, task) => {
    over('tasks', tasks =>
      assoc(
        name,
        {
          isRunning: task.isRunning(),
          isCancelled: task.isCancelled(),
          cancel: () => task.cancel(),
          result: task.result(),
          error: task.error(),
        },
        tasks || {}
      )
    );
    setTasks(get('tasks'));
  }, []);

  const runInternal = useCallback(
    ({
      saga,
      name,
      args,
      kind = 'fork',
      override = 'throw',
      sagaContext,
      scope,
    }) => {
      const task = context.runSaga(
        {scope, context: sagaContext},
        saga,
        ...args
      );

      if (kind === 'fork') {
        forkedTasksRef.current.push(task);
      }

      if (name) {
        updateTask(name, task);
        task.toPromise().then(
          () => {
            updateTask(name, task);
          },
          y => console.log('re', y)
        );
      }

      return task;
    },
    []
  );

  const fork = useCallback(
    (...props) => {
      const [name, saga, args] = parseSagaArgs(props);

      return runInternal({
        saga,
        name,
        args,
        kind: 'fork',
        scope: context.scope,
        sagaContext,
      });
    },
    [context.scope, ...argsValues]
  );

  const spawn = useCallback(
    (...props) => {
      const [name, saga, args] = parseSagaArgs(props);

      return runInternal({
        saga,
        name,
        args,
        kind: 'spawn',
        scope: context.scope,
        sagaContext,
      });
    },
    [context.scope, ...argsValues]
  );

  const forkLeading = useCallback(notImplementedYet, []);
  const forkLatest = useCallback(notImplementedYet, []);

  const spawnLeading = useCallback(notImplementedYet, []);
  const spawnLatest = useCallback(notImplementedYet, []);

  return {
    fork,
    forkLeading,
    forkLatest,
    spawn,
    spawnLeading,
    spawnLatest,
    tasks,
  };
};

export default useSagaRunner;
