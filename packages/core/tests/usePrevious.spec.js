import React from 'react';
import {usePrevious} from '../src/main';
import {renderHook, act} from 'react-hooks-testing-library';

describe('usePrevious', () => {
  it('returns undefined on initial call', () => {
    const {result} = renderHook(({number}) => usePrevious(number), {
      initialProps: {number: 1},
    });

    expect(result.current).toBe(undefined);
  });

  it('returns previous value', () => {
    const {result, rerender} = renderHook(({number}) => usePrevious(number), {
      initialProps: {number: 1},
    });

    rerender({number: 2});

    expect(result.current).toBe(1);
  });

  it('holds previous value', () => {
    const {result, rerender} = renderHook(({number}) => usePrevious(number), {
      initialProps: {number: 1},
    });

    rerender({number: 2});
    expect(result.current).toBe(1);
    rerender({number: 2});
    expect(result.current).toBe(2);
    rerender({number: 2});
    expect(result.current).toBe(2);
  });
});
