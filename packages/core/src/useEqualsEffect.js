import {useRef} from 'react';
import {equals} from 'ramda';

const useEqualsEffect = (effect, inputs) => {
  const prev = useRef(null);
  const prevDispose = useRef(null);

  if (!equals(inputs, prev.current)) {
    if (typeof prevDispose.current === 'function') {
      prevDispose.current();
    }
    prevDispose.current = effect();
  }

  prev.current = inputs;
};

export default useEqualsEffect;
