import {and, attempt, chain, chainRej, fork, Future, hook, resolve} from 'fluture';
import {useCallback, useRef, useState} from 'react';
import {append, filter, identity, pipe, startsWith} from 'ramda';

const spawnFuture = ({setRunning, options: {debug}}) => ({key, future, label}) =>
  Future((rej, res) => {
    const dispose = future |> chainRej(e => console.error(`task ${key} failed with:`, e) || resolve(''))|> fork(res)(res);
    if (debug) {
      console.log(`running: ${label}`);
    }

    const cancel = () => {
      if (debug) {
        console.log(`cancelled: ${label}`);
      }
      res(true);
      dispose();
    };

    setRunning({key, future, label, cancel});

    return () => {};
  });

const useNextState = initialState => {
  const [state, setState] = useState(0);
  const ref = useRef(initialState);

  const setState2 = useCallback(newState => {
    ref.current =
      typeof newState === 'function' ? newState(ref.current) : newState;
    setState(x => x + 1);
    return ref.current;
  }, []);

  return [ref.current, setState2, ref];
};

const useScheduler = (options = {debug: false}) => {
  const [running, setRunning, runningRef] = useNextState(null);
  const [queue, setQueue, queueRef] = useNextState([]);

  const enqueueLabeled = useCallback(({key, label}) => future => {
    attempt(() => {
      if (runningRef.current && startsWith(key, runningRef.current.key)) {
        runningRef.current.cancel();
      }

      setQueue(
        pipe(
          filter(t => !startsWith(key, t.key)),
          append({key, future, label})
        )
      );
    })
      |> chain(s =>
        !runningRef.current
          ? Future['fantasy-land/chainRec'](
              (next, done, v) =>
                queueRef.current.length === 0
                  ? attempt(() => done(true))
                  : hook(
                      attempt(() => {
                        const [head, ...tail] = queueRef.current;
                        setQueue(tail);
                        return head;
                      })
                    )(() =>
                      attempt(() => {
                        setRunning(null);
                        setQueue([...queueRef.current]);
                      })
                    )(
                      head =>
                        head
                        |> spawnFuture({setRunning, options})
                        |> and(attempt(() => next(true)))
                    ),
              s
            )
          : resolve(s)
      )
      |> fork(console.error)(identity);

    return () => {
      setQueue(filter(q => q.future !== future));

      if (runningRef.current && runningRef.current.future === future) {
        runningRef.current.cancel();
      }
    };
  }, []);

  return {
    enqueueLabeled,
    queueRef,
    queue,
    running,
    pending: !!running || queue.length > 0,
  };
};

export default useScheduler;
