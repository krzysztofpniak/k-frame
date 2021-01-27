import {
  add,
  compose,
  concat,
  flip,
  lensProp,
  lt,
  over,
  split,
  take,
  unless,
  filter,
  length,
  identity,
  assoc,
  map,
  addIndex,
  assocPath,
} from 'ramda';
import {
  forwardRef,
  memo,
  useCallback,
  useEffect,
  useMemo,
  useState,
  useImperativeHandle,
  useRef,
} from 'react';
import {
  useKReducer,
  withScope,
  createReducer,
  createStateReducer,
} from '@k-frame/core';
import React from 'react';

const mapWithKey = addIndex(map);

const counterReducer = createReducer({counter: 0}, [
  createStateReducer('INC', over(lensProp('counter'), add(1))),
]);

const counterActions = {
  inc: () => ({type: 'INC'}),
};

const Counter = compose(
  memo,
  withScope
)(({color}) => {
  const {counter, inc} = useKReducer(counterReducer, counterActions);
  return (
    <div>
      <button
        style={{backgroundColor: color || 'white', color: 'white'}}
        onClick={inc}
        type="button"
      >
        {`Clicked ${counter} times`}
      </button>
    </div>
  );
});

const Input = ({value, onChange, onBlur, inputRef, type, disabled}) => (
  <input
    value={value}
    onChange={onChange}
    onBlur={onBlur}
    ref={inputRef}
    type={type}
    style={{width: '100%', boxSizing: 'border-box'}}
    disabled={disabled}
  />
);

const SelectField = ({id, value, onChange, options, valueKey, labelKey}) => (
  <select id={id} value={value} onChange={onChange}>
    <option value="">Choose ...</option>
    {options.map((o, idx) => (
      <option key={idx} value={valueKey ? o[valueKey] : o}>
        {labelKey ? o[labelKey] : o}
      </option>
    ))}
  </select>
);

const parseName = compose(
  take(2),
  unless(
    compose(
      lt(1),
      length
    ),
    flip(concat)(['', ''])
  ),
  split(' ')
);

const FullName = ({id, value, rawValue, onChange}) => {
  console.log('FullName', value, rawValue);

  const [firstName, lastName] = useMemo(() => parseName(rawValue || ''), [
    rawValue,
  ]);

  const firstNameError = !firstName ? 'First Name is required' : '';
  const lastNameError = !lastName ? 'Last Name is required' : '';

  const errors = useMemo(
    () => filter(identity, [firstNameError, lastNameError]),
    [firstNameError, lastNameError]
  );

  const handleOnChange = useCallback(
    (first, last) => {
      onChange(`${first} ${last}`);
    },
    [onChange]
  );

  return (
    <div id={id} style={{display: 'flex'}}>
      <div>
        <input
          value={firstName}
          onChange={e => handleOnChange(e.target.value, lastName)}
        />
        <div style={{color: 'red'}}>{firstNameError}</div>
      </div>
      <div>
        <input
          value={lastName}
          onChange={e => handleOnChange(firstName, e.target.value)}
        />
        <div style={{color: 'red'}}>{lastNameError}</div>
      </div>
    </div>
  );
};

const JSONView = ({data}) => <pre>{JSON.stringify(data, null, 2)}</pre>;

const InputWithIdx = ({idx, value, onChange}) => {
  const handleChange = useCallback(e => onChange(e.target.value, idx), [
    idx,
    onChange,
  ]);

  return <input key={idx} value={value} onChange={handleChange} />;
};

const ComplexField = ({value, onChange}) => {
  const handleFirstChange = useCallback(
    (v, idx) => onChange(assocPath(['first', idx], v, value)),
    [value, onChange]
  );

  const handleSecondChange = useCallback(
    (v, idx) => onChange(assocPath(['second', idx], v, value)),
    [value, onChange]
  );

  return (
    <div>
      {mapWithKey(
        (x, idx) => (
          <InputWithIdx
            key={idx}
            idx={idx}
            value={x}
            onChange={handleFirstChange}
          />
        ),
        value.first
      )}
      {mapWithKey(
        (x, idx) => (
          <InputWithIdx
            key={idx}
            idx={idx}
            value={x}
            onChange={handleSecondChange}
          />
        ),
        value.second
      )}
    </div>
  );
};

const fieldTypes = {
  text: Input,
  password: Input,
  email: Input,
  counter: Counter,
  select: SelectField,
  static: ({value}) => <div style={{fontWeight: 'bold'}}>{value}</div>,
  json: JSONView,
  fullName: FullName,
  complexField: ComplexField,
};

export default fieldTypes;
