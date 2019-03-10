import {useWithArgs} from '../src/main';
import {renderHook, act} from 'react-hooks-testing-library';

describe('useWithArgs', () => {
  it('uses one arg', () => {
    const fn = jest.fn(a => a * 10);
    const {result} = renderHook(() => useWithArgs(fn, 9));

    const callResult = result.current();

    expect(fn.mock.calls.length).toBe(1);
    expect(fn.mock.calls[0][0]).toBe(9);
    expect(callResult).toBe(90);
  });

  it('uses two args', () => {
    const fn = jest.fn((a, b) => a + b);
    const {result} = renderHook(() => useWithArgs(fn, 'test', 'call'));

    const callResult = result.current('some', 'other', 'params');

    expect(fn.mock.calls.length).toBe(1);
    expect(fn.mock.calls[0][0]).toBe('test');
    expect(fn.mock.calls[0][1]).toBe('call');
    expect(callResult).toBe('testcall');
  });
});
