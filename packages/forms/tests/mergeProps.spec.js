import mergeProps from '../src/mergeProps';

describe('mergeProps', () => {
  it('should merge subProps', () => {
    expect(mergeProps('args', {a: 1, b: 2, args: {c: 3, d: 4}})).toEqual({
      a: 1,
      b: 2,
      c: 3,
      d: 4,
    });
  });
  it('should overwrite existing props', () => {
    expect(mergeProps('args', {a: 1, b: 2, args: {a: 3, d: 4}})).toEqual({
      a: 3,
      b: 2,
      d: 4,
    });
  });
});
