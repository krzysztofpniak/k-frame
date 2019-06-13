import React, {memo, useCallback} from 'react';
import {Form} from '../../src/main';
import fieldTypes from '../common/fieldTypes';
import {FormTemplate, Row, useSubmitAlert} from '../common';

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
    />
  );
};

export default App;
