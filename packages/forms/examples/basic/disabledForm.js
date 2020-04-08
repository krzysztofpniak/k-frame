import React, {memo, useCallback, useEffect, useState} from 'react';
import {Form} from '../../src/view';

const schema = [
  {id: 'name', title: 'Name'},
  {id: 'surname', title: 'Surname', defaultValue: 'Jaśko'},
];

const App = () => {
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
      <Form scope="form" schema={schema} disabled={disabled === 'true'} />
    </div>
  );
};

export default App;
