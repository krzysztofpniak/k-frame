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

const schema = [
  {id: 'name', title: 'ConnectionName'},
  {id: 'server', title: 'Server'},
  {id: 'port', title: 'Port'},
  {
    id: 'dbType',
    defaultValue: 'mongo',
    title: 'Database Type',
    type: 'select',
    onChange: (value, {setFields}) => {
      setFields({name: ''});
    },
    props: () => ({options: ['mongo', 'sql']}),
  },
  {
    id: 'collection',
    title: 'Collection',
    group: 'mongo',
    validate: required(),
  },
  {
    id: 'mongoUser',
    title: 'Mongo User',
    group: 'mongo',
  },
  {
    id: 'table',
    title: 'Table',
    group: 'sql',
    validate: required(),
  },
];

const MongoForm = ({fields}) => (
  <div>
    <h3>Mongo details</h3>
    <div>{fields.mongo}</div>
  </div>
);
const SqlForm = ({fields}) => (
  <div>
    <h3>Sql details</h3>
    <div>{fields.sql}</div>
  </div>
);

const DbForm = cond([[propEq('dbType', 'mongo'), MongoForm], [T, SqlForm]]);

const FormTemplate = ({buttons, fields, indexedFields, dbType}) => (
  <form>
    <div
      style={{
        border: `2px solid gray`,
        borderRadius: '5px',
        padding: '10px',
      }}
    >
      <h3>Connection Info</h3>
      {indexedFields.name}
      {indexedFields.dbType}
      <div style={{display: 'flex'}}>
        <div>{indexedFields.server}</div>
        <div>{indexedFields.port}</div>
      </div>
      <DbForm dbType={dbType} fields={fields} />
      {buttons}
    </div>
  </form>
);

const formTemplateProps = ({fields, args}) => ({dbType: fields.dbType});

const Row = ({input, title, error}) => (
  <div style={{margin: '10px 0'}}>
    <div style={{fontFamily: 'Arial, Helvetica'}}>{title}</div>
    <div>{input}</div>
    <div style={{color: 'red', fontFamily: 'Arial, Helvetica'}}>{error}</div>
  </div>
);

const Button = ({onSubmit, onReset}) => (
  <div>
    <button onClick={onSubmit} type="submit">
      Commit
    </button>
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
        formTemplateProps={formTemplateProps}
        buttonsTemplate={Button}
        onSubmit={handleSubmit}
      />
    </Scope>
  );
};

export default App;
