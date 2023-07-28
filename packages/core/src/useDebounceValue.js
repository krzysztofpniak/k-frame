import {after, attempt, chain} from 'fluture';
import {useCallback, useRef, useState} from 'react';
import {always, compose, hasPath, identity, is, map, path, pipe, reduce, when, tap, unless} from 'ramda';
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
  timeout = 1500,
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

  const handleOnChange = useCallback(eventValue => {
    eventValue |> setInputValue;
    cancelRef.current = scheduler.enqueueLabeled({
      key,
      future:
        eventValue
        |> unless(is(Function))(always)
        |> after(timeout)
        |> map(fn =>
          pipe(
            extractEventValue ? extractEventValueFn : identity,
            fn,
            serializeInput
          )
        )
        |> chain(fn =>
          attempt(() => {
            setInputValue(
              tap(
                pipe(
                  fn,
                  onChangeRef.current
                )
              )
            );
          })
        ),
      label: `${key}:${eventValue}`,
    });
  }, []);

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
