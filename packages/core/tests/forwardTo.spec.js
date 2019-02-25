import {forwardTo} from '../';

describe('forwardTo', () => {
  it('should wrap all the dispatched actions', () => {
    const dispatch = jest.fn();
    const forwarded = forwardTo(dispatch, 'Foo');

    forwarded({type: 'Bar'});

    expect(dispatch.mock.calls.length).toBe(1);
    expect(dispatch.mock.calls[0][0]).toEqual({
      type: 'Foo.Bar',
    });
  });

  it('should not modify the dispatch instance when no nesting is provided', () => {
    const dispatch = jest.fn();
    const forwarded = forwardTo(dispatch);
    expect(forwarded).toBe(dispatch);
  });
});
