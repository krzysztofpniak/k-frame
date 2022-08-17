import {and, attempt, chain, fork, Future, hook} from 'fluture';
import {useCallback, useRef, useState} from 'react';
import {always, when, identity} from 'ramda';

const spawnFuture = cancelRef => future =>
  Future((reject, resolve) => {
    const x = future |> fork(resolve)(resolve);

    const cancel = () => {
      resolve(true);
      x();
    };

    cancelRef.current = {future, cancel};
    return () => {};
  });

const useQueue = () => {
  const queueRef = useRef([]);
  const isRunningRef = useRef(false);
  const cancelRef = useRef(false);

  const [queue, setQueue] = useState([]);

  const pending = queue.length > 0;

  const enqueue = useCallback(future => {
    attempt(() => {
      queueRef.current.push(future);
      setQueue([...queueRef.current]);
    })
      |> when(always(!isRunningRef.current))(
        chain(s =>
          Future['fantasy-land/chainRec'](
            (next, done, v) =>
              queueRef.current.length === 0
                ? attempt(() => done(true))
                : hook(
                    attempt(() => {
                      isRunningRef.current = true;
                      const head = queueRef.current.shift();
                      return head;
                    })
                  )(
                    always(
                      attempt(() => {
                        isRunningRef.current = false;
                        setQueue([...queueRef.current]);
                      })
                    )
                  )(
                    head =>
                      head
                      |> spawnFuture(cancelRef)
                      |> and(attempt(() => next(true)))
                  ),
            s
          )
        )
      )
      |> fork(console.error)(identity);

    return () => {
      const idx = queueRef.current.indexOf(future);
      if (idx !== -1) {
        queueRef.current.splice(idx, 1);
        setQueue([...queueRef.current]);
      }
      if (cancelRef.current && cancelRef.current.future === future) {
        cancelRef.current.cancel();
      }
    };
  }, []);

  return {enqueue, pending};
};

export default useQueue;
