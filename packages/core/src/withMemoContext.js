import shallowEqual from './shallowEqual';

const defaultArgMap = (memo, ...rest) => [memo, ...rest];

const withMemoContext = (fn, argMap = defaultArgMap) => {
  const memo = {};
  let memoPointer = 0;
  const useMemo = (calc, id) => {
    const [prevCalc, prevId] = memo[memoPointer] || [null, null];
    let result;
    if (shallowEqual(id, prevId)) {
      result = prevCalc;
    } else {
      const newCalc = calc();
      memo[memoPointer] = [newCalc, id];
      result = newCalc;
    }
    memoPointer++;
    return result;
  };
  return (...args) => {
    memoPointer = 0;
    return fn(...argMap(useMemo, ...args));
  };
};

export default withMemoContext;
