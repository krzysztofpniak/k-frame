import {useRef} from 'react';
import {equals} from 'ramda';

const useEqualsMemo = (factory, deps) => {
  const depsRef = useRef(null);
  const resultRef = useRef(null);

  if (!equals(depsRef.current)(deps)) {
    depsRef.current = deps;
    const resultCandidate = factory();
    if (!resultRef.current || !equals(resultCandidate, resultRef.current)) {
      resultRef.current = resultCandidate;
    }
  }

  return resultRef.current;
};

export default useEqualsMemo;
