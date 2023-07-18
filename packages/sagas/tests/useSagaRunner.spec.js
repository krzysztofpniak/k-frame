import React from 'react';
import useSagaRunner from '../src/useSagaRunner';
import {KContext} from '@k-frame/core';
import {renderHook, cleanup} from '@testing-library/react';

beforeAll(() => {
  jest.spyOn(console, 'error').mockImplementation(() => {});
});

afterAll(() => {
  console.error.mockRestore();
});

afterEach(() => {
  console.error.mockClear();
  cleanup();
});

const mockTask = (props = {}) => {
  let running = true;
  let cancelled = false;
  return {
    isRunning: jest.fn(() => running),
    isCancelled: jest.fn(() => cancelled),
    cancel: jest.fn(() => {
      running = false;
      cancelled = true;
    }),
    result: jest.fn(),
    error: jest.fn(),
    toPromise: jest.fn(() => Promise.resolve()),
    ...props,
  };
};

function* saga() {
  while (true) {
    yield delay(1000);
    console.log(1000);
  }
}

describe('useSagaRunner', () => {
  it('should log error when KContext is not supplied', () => {
    renderHook(() => useSagaRunner());
    expect(console.error).toHaveBeenCalledWith(
      'KContext not found. Please place <KProvider store={store} runSaga={scopedSagaMiddleware.run}> at the top of the application.'
    );
  });

  it('should log error when runSaga is not supplied', () => {
    const dispatch = jest.fn();

    const {result} = renderHook(() => useSagaRunner(), {
      wrapper: props => (
        <KContext.Provider value={{dispatch, supplied: true}} {...props} />
      ),
    });

    expect(console.error).toHaveBeenCalledWith(
      'runSaga not found in <KProvider>. Please place <KProvider store={store} runSaga={scopedSagaMiddleware.run}> at the top of the application.'
    );
  });

  it('should fork sagas and cancel them on unmount', () => {
    const scopeData = {};
    const dispatch = jest.fn();
    const getScopeProp = jest.fn(
      (scope, name) => scopeData[[...scope, name].join('.')]
    );
    const setScopeProp = jest.fn(
      (scope, name, value) => (scopeData[[...scope, name].join('.')] = value)
    );
    const task1 = mockTask();
    const task2 = mockTask();
    const task3 = mockTask();
    const runSaga = jest
      .fn()
      .mockReturnValueOnce(task1)
      .mockReturnValueOnce(task2)
      .mockReturnValueOnce(task3);

    const {result, unmount} = renderHook(() => useSagaRunner(), {
      wrapper: props => (
        <KContext.Provider
          value={{
            dispatch,
            supplied: true,
            runSaga,
            scope: ['scope1'],
            getScopeProp,
            setScopeProp,
          }}
          {...props}
        />
      ),
    });

    result.current.fork(saga);
    result.current.fork(saga);
    result.current.fork('saga1', saga);
    expect(result.current.tasks).toMatchObject({
      saga1: {
        error: undefined,
        isCancelled: false,
        isRunning: true,
        result: undefined,
      },
    });
    expect(runSaga).toHaveBeenCalledTimes(3);
    expect(task1.cancel).toHaveBeenCalledTimes(0);
    expect(task2.cancel).toHaveBeenCalledTimes(0);
    expect(task3.cancel).toHaveBeenCalledTimes(0);
    unmount();
    expect(task1.cancel).toHaveBeenCalledTimes(1);
    expect(task2.cancel).toHaveBeenCalledTimes(1);
    expect(task3.cancel).toHaveBeenCalledTimes(1);
  });
});
