import arePropsEqual from '../src/arePropsEqual';

describe('arePropsEqual', () => {
  it('should return true for equal props', () => {
    expect(arePropsEqual([], null, null)).toBe(true);
    expect(arePropsEqual([], {a: 1, b: 2}, {c: 1, d: 2})).toBe(true);
    expect(arePropsEqual(['a'], {a: 1, b: 2}, {a: 1, c: 2})).toBe(true);
    expect(arePropsEqual(['a', 'b'], {a: 1, b: 2}, {a: 1, b: 2})).toBe(true);
  });
  it('should return false for not equal props', () => {
    expect(arePropsEqual(['a'], {a: 1, b: 2}, {a: 2, b: 2})).toBe(false);
  });
});
