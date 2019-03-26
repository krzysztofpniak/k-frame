import tryUnwrapAction from '../src/tryUnwrapAction';

describe('createScopeActionMatcher', () => {
  it('should return false when no match', () => {
    const unwrappedAction = tryUnwrapAction('prefix', {type: 'inc'});
    expect(unwrappedAction).toBe(null);
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
