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
    validate: required,
  },
  {
    id: 'job',
    title: 'Job',
    type: 'counter',
    props: ({color}) => ({color}),
  },
  {
    id: 'job2',
    title: 'Job 2',
    type: 'counter',
    props: ({color}) => ({color}),
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

export default SimpleForm;
