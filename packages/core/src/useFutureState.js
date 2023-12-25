import {attempt, bichain, chain, encase, reject, map} from 'fluture';
import {AsyncState} from './asyncState';
import {always} from 'ramda';
import {useMemo, useState} from 'react';

const storeFutureResult = setState => futureCreator => data =>
  attempt(() => setState(AsyncState.Running({})))
  |> chain(() => futureCreator(data))
  |> bichain(
    reason =>
      encase(setState)(AsyncState.Faulted(reason, {}))
      |> chain(() => reject(reason))
  )(
    result =>
      encase(setState)(AsyncState.Completed(result, {})) |> map(always(result))
  );

const useFutureState = () => {
  const [state, setState] = useState(AsyncState.Created);

  const storeFuture = useMemo(() => storeFutureResult(setState), []);

  return [state, storeFuture];
};

export default useFutureState;
