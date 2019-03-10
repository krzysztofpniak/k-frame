import {wrapAction} from '../src/main';

describe('wrapAction', () => {
  it('should wrap action', () => {
    expect(wrapAction({type: 'Bar'}, 'Foo')).toEqual({
      type: 'Foo.Bar',
    });
  });

  it('should not modify the dispatch instance when no nesting is provided', () => {
    const action = {type: 'Bar'};
    expect(wrapAction(action)).toBe(action);
  });
});
