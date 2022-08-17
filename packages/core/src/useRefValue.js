import {useRef} from 'react';

const useRefValue = value => {
  const valueRef = useRef();
  valueRef.current = value;
  return valueRef;
};

export default useRefValue;
