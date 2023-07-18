import React from 'react';
import {createStoreMock} from './testData';
import {KProvider, useScopeProps} from '../src/main';
import {renderHook, act} from '@testing-library/react';
import Scope from '../src/scope';

let store = null;

const initStore = () => {
  store = createStoreMock();
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

describe('useScopeProps', () => {
  it('returns undefined on initial call', () => {
    const {result} = renderHook(
      () => useScopeProps(),
      wrapWithKContext('scope1')
    );

    result.current.set('name', 'John');

    expect(result.current.get('name')).toBe('John');
  });

  it('holds value between renders', () => {
    const {result, rerender} = renderHook(
      () => useScopeProps(),
      wrapWithKContext('scope1')
    );

    result.current.set('name', 'John');

    rerender();
    expect(result.current.get('name')).toBe('John');

    result.current.set('name', 'Anne');
    rerender();
    expect(result.current.get('name')).toBe('Anne');
  });

  it('over works', () => {
    const {result, rerender} = renderHook(
      () => useScopeProps(),
      wrapWithKContext('scope1')
    );

    result.current.set('counter', 1);

    rerender();
    result.current.over('counter', counter => counter + 1);
    expect(result.current.get('counter')).toBe(2);
  });
});
