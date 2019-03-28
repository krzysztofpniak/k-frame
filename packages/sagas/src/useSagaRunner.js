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

  const fork = useCallback(
    (...props) => {
      let name, saga, args;

      if (typeof props[0] === 'string') {
        [name, saga, ...args] = props;
      } else {
        [saga, ...args] = props;
      }

      const task = context.runSaga(
        {scope: context.scope, context: sagaContext},
        saga,
        ...args
      );

      forkedTasksRef.current.push(task);

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
    [context.scope, ...argsValues]
  );

  const forkLeading = useCallback(notImplementedYet, []);
  const forkLatest = useCallback(notImplementedYet, []);

  const spawn = useCallback(notImplementedYet, []);
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
