import {useRef} from 'react';
import {equals} from 'ramda';

const useEqualsEffect = (effect, inputs) => {
  const prev = useRef(null);

  if (!equals(inputs, prev.current)) {
    effect();
  }

  prev.current = inputs;
};

export default useEqualsEffect;
