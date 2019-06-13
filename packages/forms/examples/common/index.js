import React, {useCallback} from 'react';

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

const fontFamily = 'Arial, Helvetica';

const Row = ({input, title, error, pending}) => (
  <div style={{margin: '10px 0'}}>
    <div style={{fontFamily}}>{title}</div>
    {pending ? <div style={{fontFamily}}>Loading ...</div> : <div>{input}</div>}
    <div style={{color: 'red', fontFamily}}>{error}</div>
  </div>
);

const useSubmitAlert = () =>
  useCallback((defaultSubmitHandler, fields) => {
    const errors = defaultSubmitHandler();
    if (errors.length === 0) {
      alert(JSON.stringify(fields, null, 2));
    }
  }, []);

export {FormTemplate, Row, useSubmitAlert};
