import {after, attempt, chain} from 'fluture';
import {useCallback, useEffect, useMemo, useState} from 'react';
import {
  compose,
  equals,
  hasPath,
  is,
  map,
  path,
  pipe,
  toString,
  when,
  identity,
} from 'ramda';
import useRefValue from './useRefValue';
import useEqualsUpdateEffect from './useEqualsUpdateEffect';

const extractEventValue = compose(
  when(is(Boolean), toString),
  when(
    hasPath(['target', 'checked']),
    pipe(
      path(['target', 'checked']),
      toString
    )
  ),
  when(hasPath(['target', 'value']), path(['target', 'value']))
);

const useDebounceValue = ({
  value,
  onChange,
  parseValue = identity,
  serializeInput = identity,
  timeout = 500,
  scheduler,
}) => {
  const inputInitialValue = useMemo(() => parseValue(value), []);
  const [inputValue, setInputValue] = useState(inputInitialValue);
  const onChangeRef = useRefValue(onChange);

  const handleOnChange = useCallback(event => {
    event |> extractEventValue |> setInputValue;
  }, []);

  useEqualsUpdateEffect(
    () =>
      attempt(() => value |> parseValue |> setInputValue) |> scheduler.enqueue,
    [value]
  );

  useEqualsUpdateEffect(
    () =>
      inputValue
      |> after(timeout)
      |> map(serializeInput)
      |> chain(value => attempt(() => onChange(value || '')))
      |> scheduler.enqueue,
    [inputValue, onChange]
  );

  const inputValueRef = useRefValue(inputValue);
  const valueRef = useRefValue(value);

  useEffect(() => {
    return () => {
      if (!equals(inputValueRef.current)(valueRef.current)) {
        onChangeRef.current(inputValueRef.current);
      }
    };
  }, []);

  return [inputValue, handleOnChange];
};

export default useDebounceValue;
