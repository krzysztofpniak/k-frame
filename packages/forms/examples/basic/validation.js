import React, {memo, useCallback, useRef, useState} from 'react';
import {Form} from '../../src/main';
import fieldTypes from '../common/fieldTypes';
import {FormTemplate, Row, useSubmitAlert} from '../common';
import {required} from '../../src/validators';
import {after, chain, resolve, reject, fork} from 'fluture';
import {alwaysStrategy} from '../../src/errorsDisplayStrategies';
import {Scope} from '@k-frame/core';

const nameValidator = name =>
  after(1000)(name)
  |> chain(() =>
    /\w+\d+$/.test(name) ? resolve('') : reject('name already taken')
  );

const schema = [
  {
    id: 'name',
    title: 'Name',
    validate: [required(), nameValidator],
  },
  {
    id: 'age',
    title: 'Age',
    defaultValue: 10,
    validate: v => (v < 18 ? 'At least 18 years' : ''),
  },
  {
    id: 'color',
    type: 'color',
    title: 'Favorite Color',
    defaultValue: 'green',
    debounce: 200,
    props: ({fields: {age}, args: {color}}) => ({age, color}),
    format: c => console.log('color.format') || after(500)(c ? '#' + c : ''),
    validate: [
      required(),
      (v, {args: {color}, formattedValue}, useMemo) => {
        console.log('color.validate');
        const message = useMemo(
          () =>
            console.log('color message recalculated') ||
            `Color is different than ${color}`,
          [color]
        );
        return formattedValue !== '#' + color ? message : '';
      },
    ],
    visible: ({fields: {age}}) => age < 25,
  },
  {
    id: 'password',
    title: 'Password',
    type: 'password',
    defaultValue: '',
    validate: required(),
  },
  {
    id: 'passwordConfirm',
    title: 'Password Confirm',
    type: 'password',
    defaultValue: '',
    props: ({fields: {password}}) => ({password}),
    validate: [
      (v, {fields: {password}}) =>
        v !== password ? `Passwords must match` : '',
    ],
  },
];

const App = () => {
  const handleSubmit = useSubmitAlert();
  const [color, setColor] = useState('red');
  const formRef = useRef();

  return (
    <Scope scope="root">
      <div>
        <input value={color} onChange={e => setColor(e.target.value)} />
        <Form
          scope="form"
          ref={formRef}
          schema={schema}
          fieldTypes={fieldTypes}
          fieldTemplate={Row}
          formTemplate={FormTemplate}
          onSubmit={handleSubmit}
          args={{color}}
          //errorsDisplayStrategy={alwaysStrategy}
        />
        <button
          onClick={() =>
            formRef.current.validatePickFuture(['name'])
            |> fork(console.error)(console.log)
          }
          type="button"
        >
          validate name
        </button>
        <button
          onClick={() =>
            formRef.current.validateOmitFuture(['name'])
            |> fork(console.error)(console.log)
          }
          type="button"
        >
          validate except name
        </button>
      </div>
    </Scope>
  );
};

export default App;
