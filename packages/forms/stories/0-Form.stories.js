import React, {useCallback, useRef, useState} from 'react';
import {linkTo} from '@storybook/addon-links';
import fieldTypes from '../examples/common/fieldTypes';
import {Form} from '../src/view';
import {required} from '../src/validators';
import kFrameDecorator from './helpers/kFrameDecorator';

export default {
  title: 'Simple',
  component: Form,
  decorators: [kFrameDecorator],
};

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
];

export const Simple = () => (
  <Form scope="s1" autoFocus schema={schema} fieldTypes={fieldTypes} />
);

export const Disabled = () => {
  const [disabled, setDisabled] = useState('true');
  const handleDisabledChange = useCallback(e => {
    setDisabled(e.target.value);
  }, []);

  return (
    <div>
      <select value={disabled} onChange={handleDisabledChange}>
        <option value="true">disabled</option>
        <option value="false">enabled</option>
      </select>
      <Form
        scope="form"
        schema={schema}
        disabled={disabled === 'true'}
        fieldTypes={fieldTypes}
      />
    </div>
  );
};

const schemas = {
  user: [
    {id: 'name', title: 'Name'},
    {id: 'surname', title: 'Surname', defaultValue: 'Jaśko'},
  ],
  admin: [
    {id: 'name', title: 'Name'}, //lens: lensPath(['config', '0', 'value'])
    {id: 'surname', title: 'Surname', defaultValue: 'John'},
    {id: 'age', title: 'Age'},
  ],
};

export const DynamicSchema = () => {
  const [schemaId, setSchemaId] = useState('admin');
  const [dialogVisible, setDialogVisible] = useState(false);
  const handleSchemaChange = useCallback(e => {
    setSchemaId(e.target.value);
  }, []);

  return (
    <div>
      <select value={schemaId} onChange={handleSchemaChange}>
        <option value="user">user</option>
        <option value="admin">admin</option>
      </select>
      <button onClick={() => setDialogVisible(!dialogVisible)}>Toggle</button>
      {dialogVisible && (
        <Form scope="form" schema={schemas[schemaId]} fieldTypes={fieldTypes} />
      )}
    </div>
  );
};

export const ImperativeApi = () => {
  const form = useRef({});

  const externalApiCall = useCallback(() => {
    const {validate, getFields} = form.current;
    const errors = validate();
    alert(JSON.stringify(errors.length ? errors : getFields()));
  }, []);

  return (
    <div>
      <button onClick={externalApiCall}>Validate</button>
      <Form
        scope="imperative"
        ref={form}
        schema={schema}
        fieldTypes={fieldTypes}
      />
    </div>
  );
};
