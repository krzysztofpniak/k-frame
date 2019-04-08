import tryUnwrapAction from '../src/tryUnwrapAction';

describe('createScopeActionMatcher', () => {
  it('should return null when no match', () => {
    const unwrappedAction = tryUnwrapAction('prefix', {type: 'inc'});
    expect(unwrappedAction).toBe(null);
  });

  it('should pass action when prefix is empty', () => {
    const action = {
      type: 'inc',
    };
    const unwrappedAction = tryUnwrapAction('', action);
    expect(unwrappedAction).toBe(action);
  });

  it('should return unwrapped action', () => {
    const unwrappedAction = tryUnwrapAction('prefix', {
      type: 'prefix.inc',
    });
    expect(unwrappedAction).toEqual({type: 'inc'});
  });

  it('should return unwrapped action with dots in type', () => {
    const unwrappedAction = tryUnwrapAction('a.b.c', {
      type: 'a.b.c.inc',
    });
    expect(unwrappedAction).toEqual({type: 'inc'});
  });
});
