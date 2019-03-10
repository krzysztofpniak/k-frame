import React from 'react';
import {withDebug} from '../src/main';
import {render} from 'react-testing-library';

beforeAll(() => {
  jest.spyOn(console, 'log').mockImplementation(() => {});
});

afterAll(() => {
  console.log.mockRestore();
});

afterEach(() => {
  console.log.mockClear();
});

describe('withDebug', () => {
  it('no logs when no changes in props', () => {
    const TestComponent = withDebug('test 1')(() => <div>Test</div>);

    const onRender = jest.fn();

    const someObj = {
      x: 'y',
    };

    const {container} = render(<TestComponent a="1" b={someObj} />);
    render(<TestComponent a="1" b={someObj} />, {container});

    expect(console.log.mock.calls.length).toBe(0);
  });

  it('logs changes in props', () => {
    const TestComponent = withDebug('test 1')(() => <div>Test</div>);

    const onRender = jest.fn();

    const {container} = render(<TestComponent a="1" b="2" c="3" />);
    render(<TestComponent a="2" b="3" c="3" />, {container});

    expect(console.log.mock.calls.length).toBe(1);
    expect(console.log.mock.calls[0][0]).toEqual('changed test 1: a, b');
    expect(console.log.mock.calls[0][1]).toEqual({a: '1', b: '2'});
    expect(console.log.mock.calls[0][2]).toEqual({a: '2', b: '3'});
  });

  it('logs changes when prop added', () => {
    const TestComponent = withDebug('test 1')(() => <div>Test</div>);

    const onRender = jest.fn();

    const {container} = render(<TestComponent a="1" b="2" />);
    render(<TestComponent a="2" b="3" c="3" />, {container});

    expect(console.log.mock.calls.length).toBe(1);
    expect(console.log.mock.calls[0][0]).toEqual('changed test 1: a, b, c');
    expect(console.log.mock.calls[0][1]).toEqual({a: '1', b: '2'});
    expect(console.log.mock.calls[0][2]).toEqual({a: '2', b: '3', c: '3'});
  });

  it('logs changes when prop removed', () => {
    const TestComponent = withDebug('test 1')(() => <div>Test</div>);

    const onRender = jest.fn();

    const {container} = render(<TestComponent a="1" b="2" c="c" />);
    render(<TestComponent a="2" b="3" />, {container});

    expect(console.log.mock.calls.length).toBe(1);
    expect(console.log.mock.calls[0][0]).toEqual('changed test 1: a, b, c');
    expect(console.log.mock.calls[0][1]).toEqual({a: '1', b: '2', c: 'c'});
    expect(console.log.mock.calls[0][2]).toEqual({a: '2', b: '3'});
  });
});
