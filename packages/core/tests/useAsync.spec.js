import React from 'react';
import {useAsync, KContext} from '../src/main';
import {renderHook, act} from 'react-hooks-testing-library';

const asyncMiddleware = store => fn => args => fn(...args);

describe('useAsync', () => {
  it('dispatches suceeded with one arg', () => {
    const fn = jest.fn(a => Promise.resolve(a * 10));
    const dispatch = jest.fn();
    const {result} = renderHook(() => useAsync(fn, 'test', 9), {
      wrapper: props => (
        <KContext.Provider value={{dispatch, asyncMiddleware}} {...props} />
      ),
    });

    return result.current(2).then(data => {
      expect(data).toBe(20);
      expect(fn.mock.calls.length).toBe(1);

      expect(dispatch.mock.calls.length).toBe(2);
      expect(dispatch.mock.calls[0][0]).toEqual({
        type: `async/test/request`,
        payload: undefined,
      });
      expect(dispatch.mock.calls[1][0]).toEqual({
        type: `async/test/succeeded`,
        payload: 20,
      });
    });
  });

  it('dispatches failed', () => {
    const fn = jest.fn(a => Promise.reject('an error occurred'));
    const dispatch = jest.fn();
    const {result} = renderHook(() => useAsync(fn, 'test', 9), {
      wrapper: props => (
        <KContext.Provider value={{dispatch, asyncMiddleware}} {...props} />
      ),
    });

    return result.current(2).then(
      () => {},
      error => {
        expect(error).toBe('an error occurred');
        expect(fn.mock.calls.length).toBe(1);

        expect(dispatch.mock.calls.length).toBe(2);
        expect(dispatch.mock.calls[0][0]).toEqual({
          type: `async/test/request`,
          payload: undefined,
        });
        expect(dispatch.mock.calls[1][0]).toEqual({
          type: `async/test/failed`,
          payload: 'an error occurred',
        });
      }
    );
  });
});
