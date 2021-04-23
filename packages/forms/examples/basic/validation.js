import React, {memo, useCallback} from 'react';
import {Form} from '../../src/main';
import fieldTypes from '../common/fieldTypes';
import {FormTemplate, Row, useSubmitAlert} from '../common';
import {required} from '../../src/validators';

const nameValidator = name =>
  new Promise((resolve, reject) =>
    setTimeout(
      () =>
        /\w+\d+$/.test(name) ? resolve('') : resolve('name already taken'),
      1000
    )
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
    validate: v => (v < 18 ? 'At least 18 years' : null),
  },
  {
    id: 'color',
    title: 'Favorite Color',
    defaultValue: '',
    props: ({fields: {age}, args: {color}}) => ({age, color}),
    validate: [
      required(),
      (v, {args: {color}}, useMemo) => {
        const message = useMemo(
          () =>
            console.log('color message recalculated') ||
            `Color is different than ${color}`,
          [color]
        );
        return v !== color ? message : '';
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
      (v, {password}) => (v !== password ? `Passwords must match` : ''),
    ],
  },
];

const App = () => {
  const handleSubmit = useSubmitAlert();

  return (
    <Form
      scope="form"
      schema={schema}
      fieldTypes={fieldTypes}
      fieldTemplate={Row}
      formTemplate={FormTemplate}
      onSubmit={handleSubmit}
      args={{color: 'red'}}
    />
  );
};

export default App;
