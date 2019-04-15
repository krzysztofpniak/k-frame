import {useInputTargetValue} from '../src/main';
import {renderHook, act} from 'react-hooks-testing-library';

describe('useInputTargetValue', () => {
  it('handles one arg', () => {
    const fn = jest.fn().mockReturnValue('someReturnValue');
    const {result} = renderHook(() => useInputTargetValue(fn));

    const callResult = result.current({target: {value: 'someValue'}});

    expect(fn.mock.calls.length).toBe(1);
    expect(fn.mock.calls[0][0]).toBe('someValue');
    expect(callResult).toBe('someReturnValue');
  });
});
