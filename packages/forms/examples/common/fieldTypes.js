import {add, compose, lensProp, over} from 'ramda';
import {memo} from 'react';
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

const Input = ({value, onChange, onBlur, inputRef, type}) => (
  <input
    value={value}
    onChange={onChange}
    onBlur={onBlur}
    ref={inputRef}
    type={type}
  />
);

const fieldTypes = {
  text: Input,
  password: Input,
  email: Input,
  counter: Counter,
  static: ({value}) => <div style={{fontWeight: 'bold'}}>{value}</div>,
};

export default fieldTypes;
