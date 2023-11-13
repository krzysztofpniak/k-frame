import {after, attempt, chain, encase, isFuture, resolve} from 'fluture';
import {useCallback, useRef, useState} from 'react';
import {
  always,
  compose,
  equals,
  hasPath,
  identity,
  is,
  map,
  path,
  pipe,
  reduce,
  tap,
  unless,
  when,
} from 'ramda';
import {useRefValue} from '@k-frame/core';

const extractEventValueFn = compose(
  when(hasPath(['target', 'checked']), path(['target', 'checked'])),
  when(hasPath(['target', 'value']), path(['target', 'value']))
);

const useDebounceValue = ({
  value,
  onChange,
  parseValue = identity,
  serializeInput = identity,
  normalizeInput = identity,
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

  const inputValueRef = useRefValue(inputValue);

  const enqueueChange = useCallback(
    eventValue => {
      let actualValue;

      cancelRef.current = scheduler.enqueueLabeled({
        key,
        label: `${key}:${eventValue}`,
      })(
        eventValue
          |> unless(is(Function))(always)
          |> tap(x => {
            actualValue = x(inputValueRef.current);
          })
          |> after(timeout)
          |> map(fn => pipe(fn, serializeInput))
          |> chain(fn => attempt(() => inputValueRef.current) |> map(fn))
          |> chain(unless(isFuture)(resolve))
          |> map(
            tap(x => {
              const adjustedValue =
                parseValue(x, inputValueRef.current) |> normalizeInput;

              if (!equals(actualValue, adjustedValue)) {
                setInputValue(
                  prev =>
                    parseValue(x, prev)
                    |> normalizeInput
                    |> when(always(fold))(reduce((p, c) => c, prev))
                );
              }
            })
          )
          |> chain(encase(onChangeRef.current))
      );
    },
    [scheduler.enqueueLabeled]
  );

  const onInputChange = useCallback(
    eventValue => {
      const finalValue =
        eventValue |> when(always(extractEventValue))(extractEventValueFn);
      setInputValue(finalValue);
      enqueueChange(finalValue);
    },
    [enqueueChange]
  );

  const setValue = useCallback(value => {
    if (cancelRef.current) {
      cancelRef.current();
    }

    setInputValue(prev => {
      const newInputValue =
        parseValue(value, prev)
        |> when(always(fold))(reduce((p, c) => c, prev));

      return newInputValue;
    });

    if (normalizeInput !== identity) {
      setInputValue(prev => {
        const newInputValue =
          parseValue(value, prev)
          |> normalizeInput
          |> when(always(fold))(reduce((p, c) => c, prev));

        const adjustedValue = newInputValue |> serializeInput;

        if (!equals(value, adjustedValue)) {
          onChangeRef.current(adjustedValue);
        }

        return newInputValue;
      });
    }
  }, []);

  return [inputValue, onInputChange, setValue];
};

export default useDebounceValue;
