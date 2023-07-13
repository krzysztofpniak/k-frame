import {after, attempt, chain, encase} from 'fluture';
import {useCallback, useEffect, useMemo, useRef, useState} from 'react';
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
  key,
}) => {
  const inputInitialValue = useMemo(() => parseValue(value), []);
  const [inputValue, setInputValue] = useState(inputInitialValue);
  const cancelRef = useRef();
  const onChangeRef = useRefValue(onChange);

  const handleOnChange = useCallback(event => {
    const eventValue = event |> extractEventValue;
    eventValue |> setInputValue;
    cancelRef.current = scheduler.enqueueLabeled({
      key,
      future:
        eventValue
        |> after(timeout)
        |> map(serializeInput)
        |> chain(encase(onChangeRef.current)),
      label: `${key}:${eventValue}`,
    });
  }, []);

  useEqualsUpdateEffect(() => {
    if (cancelRef.current) {
      cancelRef.current();
    }
    setInputValue(parseValue(value));
  }, [value]);

  // useEqualsUpdateEffect(
  //   () =>
  //     inputValue
  //     |> after(timeout)
  //     |> map(serializeInput)
  //     |> chain(value => attempt(() => onChange(value || '')))
  //     |> (future => ({future, key, label: `${key}:${inputValue}`}))
  //     |> scheduler.enqueueLabeled,
  //   [inputValue, onChange]
  // );

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
