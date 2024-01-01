import {useRef} from 'react';
import {equals} from 'ramda';

const useMapAccumMemo = (elementMapper, acc, list) => {
  const elements = useRef({});
  const accRef = useRef(acc);

  accRef.current = acc;

  const result = list.map((item, idx) => {
    if (
      !elements.current[idx] ||
      !equals(elements.current[idx].key, item) ||
      !equals(elements.current[idx].acc, accRef.current)
    ) {
      elements.current[idx] = {
        acc: accRef.current,
        value: elementMapper(accRef.current, item, idx),
        key: item,
      };
    }
    accRef.current = elements.current[idx].value[0];

    return elements.current[idx].value[1];
  });

  return [accRef.current, result];
};

export default useMapAccumMemo;
