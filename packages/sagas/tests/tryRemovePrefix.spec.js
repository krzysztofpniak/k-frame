import tryRemovePrefix from '../src/tryRemovePrefix';

describe('tryRemovePrefix', () => {
  it('should return null when no match', () => {
    expect(tryRemovePrefix('abc', 'def')).toEqual(null);
  });

  it('should return unprefixed text', () => {
    expect(tryRemovePrefix('abc', 'abcdef')).toEqual('def');
  });
});
