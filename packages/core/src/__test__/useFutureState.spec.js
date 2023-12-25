import {act, renderHook} from '@testing-library/react';
import {AsyncState} from '../asyncState';
import useFutureState from '../useFutureState';
import {promise, reject, resolve} from 'fluture';

describe('useFutureState', () => {
  it('should initialize state to AsyncState.Created', () => {
    const {result} = renderHook(() => useFutureState());
    expect(result.current[0]).toEqual(AsyncState.Created);
  });

  it('should return state and storeFuture', () => {
    const {result} = renderHook(() => useFutureState());
    expect(result.current).toHaveLength(2);
    expect(typeof result.current[1]).toBe('function');
  });

  it('stores resolved promise result in state', async () => {
    const {result} = renderHook(() => useFutureState());

    const rawResult = await act(
      () => result.current[1](resolve)('Hello') |> promise
    );

    expect(rawResult).toBe('Hello');
    expect(result.current[0]).toEqual(AsyncState.Completed('Hello', {}));
  });

  it('stores rejected promise result in state', async () => {
    const {result} = renderHook(() => useFutureState());

    await act(() =>
      expect(result.current[1](reject)('Some Error') |> promise).rejects.toBe(
        'Some Error'
      )
    );

    expect(result.current[0]).toEqual(AsyncState.Faulted('Some Error', {}));
  });
});
