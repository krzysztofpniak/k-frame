import React, {useContext, useLayoutEffect} from 'react';
import {withScope, KContext, KProvider} from '../src/main';
import {render} from 'react-testing-library';
import {createStoreMock} from './testData';

describe('withScope', () => {
  it('creates scope', () => {
    const store = createStoreMock();

    const TestComponent = withScope(({onRender}) => {
      const context = useContext(KContext);
      useLayoutEffect(() => {
        onRender(context);
      });
      return <div>Test</div>;
    });

    const onRender = jest.fn();

    render(
      <KProvider store={store}>
        <TestComponent scope="scope1" onRender={onRender} />
      </KProvider>
    );

    expect(onRender.mock.calls.length).toBe(1);
    expect(onRender.mock.calls[0][0].scope).toEqual(['scope1']);
  });
});
