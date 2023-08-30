import {after, attempt, chain, encase, isFuture, resolve} from 'fluture';
import {useCallback, useRef, useState} from 'react';
import {
  add,
  always,
  compose,
  hasPath,
  identity,
  is,
  map,
  path,
  pipe,
  reduce,
  unless,
  when,
} from 'ramda';
import {useEqualsUpdateEffect, useRefValue} from '@k-frame/core';

const extractEventValueFn = compose(
  when(hasPath(['target', 'checked']), path(['target', 'checked'])),
  when(hasPath(['target', 'value']), path(['target', 'value']))
);

const useDebounceValue = ({
  value,
  onChange,
  parseValue = identity,
  serializeInput = identity,
  timeout = 500,
  scheduler,
  fold,
  defaultValue = '',
  key,
  extractEventValue,
}) => {
  const [inputValue, setInputValue] = useState(
    () =>
      parseValue(value, defaultValue)
      |> when(always(fold))(reduce((p, c) => c, defaultValue))
  );

  const cancelRef = useRef();
  const onChangeRef = useRefValue(onChange);

  const [changeCounter, setChangeCounter] = useState(0);

  const inputValueRef = useRefValue(inputValue);

  const enqueueChange = useCallback(
    eventValue => {
      cancelRef.current = scheduler.enqueueLabeled({
        key,
        label: `${key}:${eventValue}`,
      })(
        eventValue
          |> unless(is(Function))(always)
          |> after(timeout)
          |> map(fn => pipe(fn, serializeInput))
          |> chain(fn => attempt(() => inputValueRef.current) |> map(fn))
          |> chain(unless(isFuture)(resolve))
          |> chain(encase(onChangeRef.current))
          |> chain(() => encase(setChangeCounter)(add(1)))
      );
    },
    [scheduler.enqueueLabeled]
  );

  const handleOnChange = useCallback(
    eventValue => {
      const finalValue =
        eventValue |> when(always(extractEventValue))(extractEventValueFn);
      setInputValue(finalValue);
      enqueueChange(finalValue);
    },
    [enqueueChange]
  );

  useEqualsUpdateEffect(() => {
    if (cancelRef.current) {
      cancelRef.current();
    }
    setInputValue(
      prev =>
        parseValue(value, prev) |> when(always(fold))(reduce((p, c) => c, prev))
    );
  }, [value]);

  return [inputValue, handleOnChange];
};

export default useDebounceValue;
