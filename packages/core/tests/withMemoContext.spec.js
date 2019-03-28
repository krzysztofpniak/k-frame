import withMemoContext from '../src/withMemoContext';

describe('withMemoContext', () => {
  it('should inject memo fn', () => {
    const mock1 = jest.fn((a, b) => a + b);
    const mock2 = jest.fn((a, b) => a * b);
    const mock3 = jest.fn((add, mul) => ({add, mul}));

    const f = withMemoContext((memo, a, b) => {
      const add = memo(() => mock1(a, b), [a, b]);
      const mul = memo(() => mock2(a, b), [a, b]);
      const result = memo(() => mock3(add, mul), [add, mul]);

      return result;
    });

    const res1 = f(2, 3);
    f(2, 3);
    const res2 = f(3, 2);
    f(3, 2);

    expect(res1).toEqual({add: 5, mul: 6});
    expect(res2).toEqual({add: 5, mul: 6});
    expect(res1).toBe(res2);

    expect(mock1).toHaveBeenCalledTimes(2);
    expect(mock2).toHaveBeenCalledTimes(2);
    expect(mock3).toHaveBeenCalledTimes(1);
  });

  it('should use argMap', () => {
    const mock1 = jest.fn((a, b) => a + b);
    const mock2 = jest.fn((a, b) => a * b);
    const mock3 = jest.fn((add, mul) => ({add, mul}));

    const f = withMemoContext(
      (a, b, {useMemo}) => {
        const add = useMemo(() => mock1(a, b), [a, b]);
        const mul = useMemo(() => mock2(a, b), [a, b]);
        const result = useMemo(() => mock3(add, mul), [add, mul]);

        return result;
      },
      (useMemo, a, b) => [a, b, {useMemo}]
    );

    expect(f(2, 3)).toEqual({add: 5, mul: 6});
  });
});
