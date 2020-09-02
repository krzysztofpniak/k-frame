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
} from 'ramda';
import {memo, useCallback, useEffect, useMemo, useState} from 'react';
import {
  useKReducer,
  withScope,
  createReducer,
  createStateReducer,
} from '@k-frame/core';
import React from 'react';

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

const FullName = ({id, value, onChange, showErrors}) => {
  const [firstName, lastName] = useMemo(() => parseName(value || ''), [value]);

  const handleOnChange = useCallback(
    (first, last) => {
      const firstNameError = !first ? 'First Name is required' : '';
      const lastNameError = !last ? 'Last Name is required' : '';
      const errors = filter(identity, [firstNameError, lastNameError]);
      onChange(`${first} ${last}`, errors);
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
        <div style={{color: 'red'}}>
          {showErrors && !firstName && 'First Name is required'}
        </div>
      </div>
      <div>
        <input
          value={lastName}
          onChange={e => handleOnChange(firstName, e.target.value)}
        />
        <div style={{color: 'red'}}>
          {showErrors && !lastName && 'Last Name is required'}
        </div>
      </div>
    </div>
  );
};

const JSONView = ({data}) => <pre>{JSON.stringify(data, null, 2)}</pre>;

const fieldTypes = {
  text: Input,
  password: Input,
  email: Input,
  counter: Counter,
  select: SelectField,
  static: ({value}) => <div style={{fontWeight: 'bold'}}>{value}</div>,
  json: JSONView,
  fullName: FullName,
};

export default fieldTypes;
