import React, {useContext, useLayoutEffect} from 'react';
import {KContext, KProvider} from '../src/main';
import {render} from 'react-testing-library';
import Scope from '../src/scope';

const TestComponent = ({onRender}) => {
  const context = useContext(KContext);
  useLayoutEffect(() => {
    onRender(context);
  });
  return <div>Test</div>;
};

const createStoreMock = () => ({
  dispatch: jest.fn(),
  getState: jest.fn(),
  subscribe: jest.fn(),
  replaceReducer: jest.fn(),
});

beforeAll(() => {
  jest.spyOn(console, 'error').mockImplementation(() => {});
});

afterAll(() => {
  console.error.mockRestore();
});

afterEach(() => {
  console.error.mockClear();
});

describe('KProvider', () => {
  it('provides context', () => {
    let context;
    const onRender = c => (context = c);

    const store = createStoreMock();

    render(
      <KProvider store={store}>
        <TestComponent onRender={onRender} />
      </KProvider>
    );

    context.getState();
    context.dispatch({type: 'someAction'});
    context.subscribe();
    context.assocReducer(['a'], (s = {}) => s);

    expect(context.scope).toEqual([]);
    expect(context.supplied).toBe(true);
    expect(store.getState.mock.calls.length).toBe(1);
    expect(store.dispatch.mock.calls.length).toBe(1);
    expect(store.dispatch.mock.calls[0][0]).toEqual({type: 'someAction'});
    expect(store.subscribe.mock.calls.length).toBe(1);
    expect(store.replaceReducer.mock.calls.length).toBe(1);
  });

  it('warns about missing context', () => {
    const errorMessage =
      'Please Use <KProvider> component at the top of your application.';
    let context;
    const onRender = c => (context = c);

    render(<TestComponent onRender={onRender} />);

    context.getState();
    context.dispatch({type: 'someAction'});
    context.subscribe();
    context.assocReducer(['a'], (s = {}) => s);
    context.runSaga();

    expect(context.supplied).toBe(false);
    expect(console.error.mock.calls.length).toBe(5);
    expect(console.error.mock.calls[0][0]).toBe(errorMessage);
    expect(console.error.mock.calls[1][0]).toBe(errorMessage);
    expect(console.error.mock.calls[2][0]).toBe(errorMessage);
    expect(console.error.mock.calls[3][0]).toBe(errorMessage);
    expect(console.error.mock.calls[4][0]).toBe(errorMessage);
  });

  it('it logs error when KProvider already defined', () => {
    const store = createStoreMock();

    render(
      <KProvider store={store}>
        <KProvider store={store}>
          <div>some content</div>
        </KProvider>
      </KProvider>
    );

    expect(console.error.mock.calls.length).toBe(1);
    expect(console.error.mock.calls[0][0]).toBe(
      '<KProvider> already defined. Please remove redundant usage.'
    );
  });

  describe('scope props', () => {
    it('should store scope props', () => {
      const staticReducer = jest.fn();
      let context;
      const onRender = c => (context = c);

      const store = createStoreMock();

      render(
        <KProvider store={store} staticReducer={staticReducer}>
          <TestComponent onRender={onRender} />
        </KProvider>
      );

      const user = {
        name: 'Anne',
        surname: 'Newton',
      };

      context.setScopeProp(['a'], 'name', 'John');
      context.setScopeProp(['a', 'b'], 'currentUser', user);

      const name = context.getScopeProp(['a'], 'name');
      const currentUser = context.getScopeProp(['a', 'b'], 'currentUser');

      expect(name).toBe('John');
      expect(currentUser).toBe(user);
    });
  });

  it('uses static reducer', () => {
    const staticReducer = jest.fn();
    let context;
    const onRender = c => (context = c);

    const store = createStoreMock();

    render(
      <KProvider store={store} staticReducer={staticReducer}>
        <TestComponent onRender={onRender} />
      </KProvider>
    );

    context.assocReducer(['a'], (s = {}) => s);

    //TODO
  });
});
