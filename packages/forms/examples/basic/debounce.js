import React, {useCallback, useEffect, useMemo, useState} from 'react';
import {Form} from '../../src/main';
import baseFieldTypes from '../common/fieldTypes';
import {FormTemplate, Row, useSubmitAlert} from '../common';
import {
  useScheduler,
  useEqualsUpdateEffect,
  useRefValue,
  useDebounceValue,
} from '@k-frame/core';
import {
  assoc,
  compose,
  equals,
  hasPath,
  identity,
  is,
  map,
  path,
  pipe,
  tap,
  toString,
  when,
} from 'ramda';

import {after, attempt, chain} from 'fluture';

const parseIntNull = v => {
  const parsed = parseInt(v, 10);
  return isNaN(parsed) ? null : parsed;
};

const dbOptions = ['mongo', 'sql'];

const defaultConnections = {
  mongo: 'mongodb://mongodb0.example.com:27017/admin',
  sql:
    'Server=myServerAddress;Database=myDataBase;Uid=myUsername;Pwd=myPassword;',
};

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

const useDebounceValue2 = ({
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

const DebouncedInput = ({value, onChange, title, scheduler}) => {
  const [inputValue, handleChange] = useDebounceValue({
    value,
    onChange,
    parseValue: identity,
    serializeInput: identity,
    scheduler,
    //timeout: 10,
  });

  return (
    <input value={inputValue} onChange={e => handleChange(e.target.value)} />
  );
};

const ComplexDebounce = ({value, onChange, scheduler}) => {
  return (
    <div>
      <DebouncedInput
        value={value.a}
        onChange={e => onChange(assoc('a', e, value))}
        scheduler={scheduler}
      />
      <DebouncedInput
        value={value.b}
        onChange={e => onChange(assoc('b', e, value)) |> tap(console.log)}
        scheduler={scheduler}
      />
    </div>
  );
};

const schema = [
  {id: 'name', title: 'ConnectionName', debounce: 2000},
  {
    id: 'complexDebounce',
    title: 'ConnectionName',
    type: 'complexDebounce',
    debounce: 2000,
  },
  {
    id: 'debug',
    title: 'Debug',
    type: 'json',
    props: ({fields: {complexDebounce}}) =>
      console.log('asd', complexDebounce) || {data: complexDebounce},
  },
  {
    id: 'connectionString',
    title: 'Connection String',
    defaultValue: defaultConnections['mongo'],
  },
];

const fieldTypes = {
  ...baseFieldTypes,
  debouncedInput: DebouncedInput,
  complexDebounce: ComplexDebounce,
};

const App = () => {
  const handleSubmit = useSubmitAlert();

  const scheduler = useScheduler();

  return (
    <Form
      scope="form"
      schema={schema}
      fieldTypes={fieldTypes}
      fieldTemplate={Row}
      formTemplate={FormTemplate}
      onSubmit={handleSubmit}
      scheduler={scheduler}
    />
  );
};

export default App;
