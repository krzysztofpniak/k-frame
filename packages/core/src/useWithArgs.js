import {useCallback} from 'react';

const useWithArgs = (fn, ...args) =>
  useCallback(() => fn(...args), [fn, ...args]);

export default useWithArgs;
