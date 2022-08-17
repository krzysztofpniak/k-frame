import {useRef} from 'react';
import {equals} from 'ramda';
import useFirstMountState from './useFirstMountState';

const useEqualsUpdateEffect = (effect, inputs) => {
  const prev = useRef(null);
  const prevDispose = useRef(null);
  const isFirstMount = useFirstMountState();

  if (!isFirstMount && !equals(inputs, prev.current)) {
    if (typeof prevDispose.current === 'function') {
      prevDispose.current();
    }

    prevDispose.current = effect();
  }

  prev.current = inputs;
};

export default useEqualsUpdateEffect;
