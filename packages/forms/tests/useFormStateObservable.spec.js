import useFormStateObservable from '../src/useFormStateObservable';
import {renderHook, cleanup} from 'react-hooks-testing-library';

afterEach(() => {
  cleanup();
});

describe('useFormStateObservable', () => {
  it('should emit when source changes', () => {
    let subject;
    const reduxSubscribe = observer => {
      subject = observer;
    };
    const subscribe = jest.fn();
    const getFormState = jest
      .fn()
      .mockReturnValueOnce(1)
      .mockReturnValueOnce(2)
      .mockReturnValueOnce(3);
    const {result} = renderHook(() => {
      const observable = useFormStateObservable(reduxSubscribe, getFormState);
      observable.subscribe({next: subscribe});
      return observable;
    });
    subject();
    subject();
    expect(subscribe).toHaveBeenCalledTimes(3);
    expect(subscribe).toHaveBeenNthCalledWith(1, 1);
    expect(subscribe).toHaveBeenNthCalledWith(2, 2);
    expect(subscribe).toHaveBeenNthCalledWith(3, 3);
  });
});
