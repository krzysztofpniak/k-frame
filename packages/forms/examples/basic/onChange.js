import React, {memo, useCallback} from 'react';
import {Form} from '../../src/main';
import {required} from '../../src/validators';
import {
  Scope,
  withScope,
  useKReducer,
  createReducer,
  createStateReducer,
} from '@k-frame/core';
import {cond, propEq, T} from 'ramda';
import fieldTypes from '../common/fieldTypes';

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

const schema = [
  {id: 'name', title: 'ConnectionName'},
  {
    id: 'dbType',
    defaultValue: 'mongo',
    title: 'Database Type',
    type: 'select',
    onChange: (value, {setFields}) => {
      setFields({
        connectionString: defaultConnections[value],
      });
    },
    props: () => ({options: dbOptions}),
  },
  {
    id: 'connectionString',
    title: 'Connection String',
    defaultValue: defaultConnections['mongo'],
  },
];

const FormTemplate = ({buttons, fields}) => (
  <form>
    <div
      style={{
        border: `2px solid gray`,
        borderRadius: '5px',
        padding: '10px',
      }}
    >
      {fields.default}
      {buttons}
    </div>
  </form>
);

const Row = ({input, title, error}) => (
  <div style={{margin: '10px 0'}}>
    <div style={{fontFamily: 'Arial, Helvetica'}}>{title}</div>
    <div>{input}</div>
    <div style={{color: 'red', fontFamily: 'Arial, Helvetica'}}>{error}</div>
  </div>
);

const App = () => {
  const handleSubmit = useCallback((defaultSubmitHandler, fields) => {
    const errors = defaultSubmitHandler();
    if (errors.length === 0) {
      alert(JSON.stringify(fields, null, 2));
    }
  }, []);

  return (
    <Scope scope="app">
      <Form
        scope="form"
        schema={schema}
        fieldTypes={fieldTypes}
        fieldTemplate={Row}
        formTemplate={FormTemplate}
        onSubmit={handleSubmit}
      />
    </Scope>
  );
};

export default App;
