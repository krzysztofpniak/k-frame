import React, {useContext, useLayoutEffect} from 'react';
import {withScope, KContext} from '../src/main';
import {render} from 'react-testing-library';

describe('withScope', () => {
  it('creates scope', () => {
    const TestComponent = withScope(({onRender}) => {
      const context = useContext(KContext);
      useLayoutEffect(() => {
        onRender(context);
      });
      return <div>Test</div>;
    });

    const onRender = jest.fn();

    render(<TestComponent scope="scope1" onRender={onRender} />);

    expect(onRender.mock.calls.length).toBe(1);
    expect(onRender.mock.calls[0][0].scope).toEqual(['scope1']);
  });
});
