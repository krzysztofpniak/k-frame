import React from 'react';
import {createStore} from 'redux';
import {useKReducer, KProvider, emptyReducer, Scope} from '../src/main';
import {
  initAction,
  counterReducer,
  counterState0,
  counterState1,
  counterActions,
} from './testData';
import {renderHook, act} from 'react-hooks-testing-library';

let store = null;

const initStore = () => {
  store = createStore(emptyReducer);
};

const wrapWithKContext = scope => ({
  wrapper: props => (
    <KProvider store={store}>
      <Scope scope={scope} {...props} />
    </KProvider>
  ),
});

beforeEach(() => {
  initStore();
});

describe('useKReducer', () => {
  it('returns initial state of the reducer', () => {
    const {result} = renderHook(
      () => useKReducer(counterReducer),
      wrapWithKContext('c1')
    );

    expect(result.current).toEqual(counterState0);
  });

  it('handles own actions', () => {
    const {result} = renderHook(
      () => useKReducer(counterReducer, counterActions),
      wrapWithKContext('c1')
    );

    act(() => {
      result.current.inc();
    });

    expect(result.current).toMatchObject({
      ...counterState1,
      inc: expect.any(Function),
      incBy: expect.any(Function),
    });
  });

  it('handles external actions', () => {
    const {result, rerender} = renderHook(
      () => useKReducer(counterReducer, counterActions),
      wrapWithKContext('c1')
    );

    act(() => {
      store.dispatch({type: 'c1.Inc'});
    });

    expect(result.current).toMatchObject({
      ...counterState1,
      inc: expect.any(Function),
      incBy: expect.any(Function),
    });
  });

  it('keeps references between renders', () => {
    const {result, rerender} = renderHook(
      () => useKReducer(counterReducer, counterActions),
      wrapWithKContext('c1')
    );

    const a = result.current;
    rerender();
    const b = result.current;

    expect(a.inc).toBe(b.inc);
    expect(a.incBy).toBe(b.incBy);
    expect(a.counter).toBe(b.counter);
  });

  it('keeps references after foreign action dispatches', () => {
    const {result, rerender} = renderHook(
      () => useKReducer(counterReducer, counterActions),
      wrapWithKContext('c1')
    );

    const a = result.current;
    act(() => {
      store.dispatch({type: 'someRandomAction1'});
      store.dispatch({type: 'someRandomAction2'});
    });
    const b = result.current;

    expect(a.inc).toBe(b.inc);
    expect(a.incBy).toBe(b.incBy);
    expect(a.counter).toBe(b.counter);
  });

  it('unsubscribes from store after unmount', () => {
    const unsubscribe = jest.fn();
    jest.spyOn(store, 'subscribe').mockImplementation(() => {
      return unsubscribe;
    });

    const {unmount} = renderHook(
      () => useKReducer(counterReducer, counterActions),
      wrapWithKContext('c1')
    );

    expect(unsubscribe.mock.calls.length).toBe(0);
    unmount();
    expect(unsubscribe.mock.calls.length).toBe(1);
  });
});
