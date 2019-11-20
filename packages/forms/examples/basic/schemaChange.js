import React, {memo, useCallback, useEffect, useState} from 'react';
import {Form} from '../../src/view';

const schemas = {
  user: [
    {id: 'name', title: 'Name'},
    {id: 'surname', title: 'Surname', defaultValue: 'Jaśko'},
  ],
  admin: [
    {id: 'name', title: 'Name'},
    {id: 'surname', title: 'Surname', defaultValue: 'John'},
  ],
};

const App = () => {
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
      {dialogVisible && <Form scope="form" schema={schemas[schemaId]} />}
    </div>
  );
};

export default App;
