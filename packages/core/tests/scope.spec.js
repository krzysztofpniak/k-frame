import React from 'react';
import {Scope, KProvider} from '../src/main';
import {render} from '@testing-library/react';
import {createStoreMock} from './testData';

beforeAll(() => {
  jest.spyOn(console, 'error').mockImplementation(() => {});
});

afterAll(() => {
  console.error.mockRestore();
});

afterEach(() => {
  console.error.mockClear();
});

describe('Scope', () => {
  it('no logs when scope defined', () => {
    const store = createStoreMock();

    render(
      <KProvider store={store}>
        <Scope scope="someScope">
          <div>some content</div>
        </Scope>
      </KProvider>
    );

    expect(console.error.mock.calls.length).toBe(0);
  });

  it('logs error when scope not defined', () => {
    const store = createStoreMock();

    render(
      <KProvider store={store}>
        <Scope>
          <div>some content</div>
        </Scope>
      </KProvider>
    );

    expect(console.error.mock.calls.length).toBe(1);
    expect(console.error.mock.calls[0][0]).toBe(
      '<Scope> component requires scope param.'
    );
  });

  it('logs error when used without KProvider', () => {
    render(
      <Scope scope="someScope">
        <div>some content</div>
      </Scope>
    );

    expect(console.error.mock.calls.length).toBe(1);
    expect(console.error.mock.calls[0][0]).toBe(
      '<Scope> requires <KProvider> at the top of the application.'
    );
  });
});
