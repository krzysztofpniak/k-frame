import React, {memo} from 'react';
import {Form} from '../../src/view';
import fieldTypes from './fieldTypes';
import {required} from '../../src/validators';

const schema = [
  {
    id: 'name',
    title: 'Name',
    defaultValue: 'John',
  },
  {
    id: 'surname',
    title: 'Surname',
    defaultValue: '',
    validate: required(),
  },
  {
    id: 'displayName',
    title: 'Display Name',
    type: 'static',
    props: ({fields: {name, surname}}) => ({value: `${name} ${surname}`}),
  },
  {
    id: 'job',
    title: 'Job',
    type: 'counter',
    props: ({args: {color}}) => ({color}),
  },
  {
    id: 'job2',
    title: 'Job 2',
    type: 'counter',
    props: ({args: {color}}) => ({color}),
  },
];

const SimpleForm = memo(({scope, color, onSubmit}) => (
  <Form
    scope={scope}
    autoFocus
    schema={schema}
    fieldTypes={fieldTypes}
    args={{color}}
    onSubmit={onSubmit}
  />
));

SimpleForm.defaultProps = {
  scope: 'form',
  args: {color: 'silver'},
};

export default SimpleForm;
